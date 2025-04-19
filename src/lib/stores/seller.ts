import { PersistedState } from "runed";
import { userRepo, UserService } from "$modules/auth";
import { BROWSER } from "esm-env";
import { route } from "@/ROUTES";

// Define registration state type
type SellerRegistrationState = {
  userId: string | undefined;
  email: string | undefined;
  emailVerified: boolean;
  registrationComplete: boolean;
  currentStep: string;
};

// Define default state
const defaultState: SellerRegistrationState = {
  userId: undefined,
  email: undefined,
  emailVerified: false,
  registrationComplete: false,
  currentStep: "email",
};

// Creates a store that works on both server and client
let regStore: { current: SellerRegistrationState };

// Create a simple server-safe store with default values
if (!BROWSER) {
  regStore = {
    get current() {
      return { ...defaultState, _isSSR: true };
    },
  };
}
else {
  regStore = new PersistedState<SellerRegistrationState>("haven_s_join", defaultState, {
    storage: "session",
    syncTabs: true,
  });
}

// Helper functions for registration flow
export const sellerRegistration = {
  get state() {
    return regStore.current;
  },
  setComplete() {
    regStore.current = {
      ...regStore.current,
      registrationComplete: true,
    };
  },
  reset() {
    regStore.current = {
      userId: undefined,
      email: undefined,
      emailVerified: false,
      registrationComplete: false,
      currentStep: "email",
    };
  },
  async createUser(email: string): Promise<string | undefined> {
    try {
      const sellerReg = userRepo.create();

      if (sellerReg && sellerReg.id) {
        regStore.current = {
          ...regStore.current,
          userId: sellerReg.id,
          email,
          emailVerified: false,
          currentStep: "verify",
        };

        return sellerReg.id;
      }

      return undefined;
    }
    catch {
      console.error("Error creating user");
      return undefined;
    }
  },
  async verifyEmail(): Promise<boolean> {
    try {
      if (!regStore.current.userId || !regStore.current.email) {
        return false;
      }

      regStore.current = {
        ...regStore.current,
        emailVerified: true,
        currentStep: "secure",
      };

      return true;
    }
    catch {
      console.error("Error verifying email");
      return false;
    }
  },
  async completeRegistration(password: string): Promise<boolean> {
    try {
      if (!regStore.current.userId || !regStore.current.emailVerified) {
        return false;
      }

      const response = await UserService.signup(
        regStore.current.userId,
        password,
      );

      if (response.success) {
        regStore.current = {
          ...regStore.current,
          registrationComplete: true,
        };
        return true;
      }

      return false;
    }
    catch {
      console.error("Error completing registration");
      return false;
    }
  },

  async ensureStepIntegrity(currentStep: string): Promise<string | null> {
    const state = regStore.current;

    if ((state as any)._isSSR) {
      return null;
    }

    if (state.registrationComplete) {
      sellerRegistration.reset();
      return route("/");
    }

    if (!state.userId || !state.email) {
      if (currentStep !== "email") {
        return "?step=email";
      }
      return null;
    }

    if (!state.emailVerified && state.email) {
      if (currentStep !== "verify" && currentStep !== "email") {
        return "?step=verify";
      }
      return null;
    }

    if (state.emailVerified && (currentStep === "email" || currentStep === "verify")) {
      return "?step=secure";
    }

    return null;
  },
};
