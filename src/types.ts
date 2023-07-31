export type Maybe<T> = T | null;

export function Just<T>(input: Maybe<T>): input is T {
  return input !== null;
}

export type Cls<T> = { new(...args: unknown[]): T };