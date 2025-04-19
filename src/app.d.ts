import type { UserInfo } from "remult";

declare global {
  namespace App {
    interface Locals {
      user?: UserInfo;
    }
  }
}

export {};
