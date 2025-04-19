import { remult } from "remult";
import { Module } from "../../lib/rms";

export const context: () => Module = () => {
  return new Module({
    name: "context",
    priority: -1000,
    initRequest: async (kitEvent) => {
      remult.context.setHeaders = (headers) => {
        kitEvent.setHeaders(headers);
      };
      remult.context.setCookie = (name, value, opts) => {
        kitEvent.cookies.set(name, value, opts);
      };
      remult.context.deleteCookie = (name, opts) => {
        kitEvent.cookies.delete(name, opts);
      };
    },
  });
};
