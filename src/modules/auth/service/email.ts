import { BackendMethod } from "remult";
import * as v from "valibot";
import * as fs from "fs";
import * as path from "path";

const emailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.email(),
  v.maxLength(255),
);

type DomainList = readonly string[];
type CacheItem = {
  readonly data: Set<string>;
  readonly expiresAt: number;
};
type UpdateResult = {
  readonly success: boolean;
  readonly error?: string;
};
type Response = {
  disposable: boolean;
  message?: string;
};

interface DisposableEmailCheckerOptions {
  readonly domainsPath?: string;
  readonly domains?: string[];
  readonly cacheTTL?: number;
  readonly logErrors?: boolean;
}

export class EmailValidator {
  private readonly domainsCache = new Map<string, CacheItem>();
  private readonly cacheKey = "disposable_domains";

  constructor(private readonly options: DisposableEmailCheckerOptions = {}) {
    this.options = {
      domainsPath: "/data/domain/domains-mx.json",
      domains: [],
      cacheTTL: 24 * 60 * 60 * 1000, // 1 day
      logErrors: true,
      ...options,
    };
  }

  /**
   * Loads domain list from file or memory
   */
  private async loadDomains(): Promise<Set<string>> {
    const { domains, domainsPath, logErrors } = this.options;

    if (domains && domains.length > 0) {
      return new Set(domains);
    }

    try {
      const filePath = path.join(process.cwd(), domainsPath!);
      const data = fs.readFileSync(filePath, "utf8");
      return new Set(JSON.parse(data) as DomainList);
    }
    catch (error: unknown) {
      if (logErrors && error instanceof Error) {
        console.error("Error loading domains:", error.message);
      }
      return new Set();
    }
  }

  private async getDomains(): Promise<Set<string>> {
    const cached = this.domainsCache.get(this.cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const domains = await this.loadDomains();
    this.domainsCache.set(this.cacheKey, {
      data: domains,
      expiresAt: now + (this.options.cacheTTL || 0),
    });

    return domains;
  }

  /**
   * Checks if an email uses a disposable domain
   * @param email The email address to check
   * @returns True if the email uses a disposable domain, false otherwise
   */
  public async isDisposableEmail(email: string): Promise<boolean> {
    if (!v.is(emailSchema, email))
      return false;

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain)
      return false;

    return (await this.getDomains()).has(domain);
  }

  /**
   * Updates the list of disposable email domains from a URL
   * @param newDomainsUrl URL to fetch the updated domain list from
   * @returns Result object with success status and optional error message
   */
  public async updateDisposableDomains(newDomainsUrl: string): Promise<UpdateResult> {
    try {
      const response = await fetch(newDomainsUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "DisposableEmailChecker/1.0",
        },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch domains: " + response.statusText };
      }

      const newDomains = await response.json();
      if (!Array.isArray(newDomains)) {
        return { success: false, error: "Invalid domains data format" };
      }

      const domains = newDomains as DomainList;
      const filePath = path.join(process.cwd(), this.options.domainsPath!);
      fs.writeFileSync(filePath, JSON.stringify(domains, null, 2));

      this.domainsCache.set(this.cacheKey, {
        data: new Set(domains),
        expiresAt: Date.now() + (this.options.cacheTTL || 0),
      });

      return { success: true };
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (this.options.logErrors) {
        console.error("Error updating domains:", message);
      }
      return { success: false, error: message };
    }
  }
}

const emailValidator = new EmailValidator();

export class EmailService {
  /**
   * Validates if an email is disposable
   * @param email Email to validate
   */
  @BackendMethod({ allowed: true, apiPrefix: "auth/email" })
  static async check(email: string): Promise<Response> {
    if (!v.is(emailSchema, email)) {
      return {
        disposable: true,
        message: "Invalid email format",
      };
    }

    const isDisposable = await emailValidator.isDisposableEmail(email);
    return isDisposable
      ? { disposable: true, message: "Domain not allowed" }
      : { disposable: false };
  }

  /**
   * Updates disposable email domains list from URL
   * @param newDomainsUrl URL to fetch domains from
   */
  @BackendMethod({ allowed: true, apiPrefix: "auth/domains" })
  static async update(newDomainsUrl: string): Promise<UpdateResult> {
    return emailValidator.updateDisposableDomains(newDomainsUrl);
  }
}
