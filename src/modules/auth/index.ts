import { Module } from "$lib/rms";
import {
  Account,
  Otp,
  Passkey,
  PasswordReset,
  Permission,
  PermissionAssignment,
  PermissionRole,
  Session,
  User,
} from "./entity";

import {
  EmailService,
  OtpService,
  PermissionService,
  UserService,
} from "./service";

export * from "./entity";
export * from "./service";

export const auth: (o?: { log: string }) => Module = (o) => {
  const m = new Module({
    name: "auth",
    entities: [
      User,
      Session,
      Account,
      Passkey,
      PasswordReset,
      PermissionRole,
      Permission,
      PermissionAssignment,
      Otp,
    ],
    controllers: [
      UserService,
      PermissionService,
      OtpService,
      EmailService,
    ],
    initApi: async () => {
      m.log.success(o?.log ?? "Ready!");
    },
  });
  return m;
};
