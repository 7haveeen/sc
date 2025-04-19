import type { UserInfo } from "remult";

import { getContext, hasContext, setContext } from "svelte";

type Getter<T> = () => T;

export class Rune<T> {
  readonly #key: symbol;

  constructor(name: string) {
    this.#key = Symbol(name);
  }

  exists(): boolean {
    return hasContext(this.#key);
  }

  get(): T {
    return getContext<Getter<T>>(this.#key)?.();
  }

  set(getter: Getter<T>): void {
    setContext(this.#key, getter);
  }
}

export const userRune = new Rune<UserInfo | undefined>("user");
