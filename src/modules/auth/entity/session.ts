import { Entity, ForbiddenError, Relations, remult, repo } from "remult";
import { User } from "./user";
import * as v from "valibot";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";

export const sessionDto = v.object({
  id: v.optional(v.string()),
  token: v.string(),
  expiresAt: v.date(),
  userId: v.string(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  impersonatedBy: v.optional(v.string()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Session>("session", {
  allowApiRead: true,
  allowApiUpdate: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  allowApiDelete: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  apiPrefilter: () => Session.filter(),
})
export class Session {
  @vFields.cuid()
  id!: string;

  @vFields.string({ input: sessionDto.entries.token })
  token!: string;

  @vFields.date({ input: sessionDto.entries.expiresAt })
  expiresAt!: Date;

  @vFields.string({ input: sessionDto.entries.userId })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user!: User;

  @vFields.string({ input: sessionDto.entries.ipAddress })
  ipAddress?: string;

  @vFields.string({ input: sessionDto.entries.userAgent })
  userAgent?: string;

  @vFields.string({ input: sessionDto.entries.impersonatedBy })
  impersonatedBy?: string;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};
    return { userId: user.id };
  };
}

export const sessionRepo = repo(Session);
export const hasSessionPerm = UIPermissions<Session>(sessionRepo);
