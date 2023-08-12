export type Maybe<T> = T | null;

export function Just<T>(input: Maybe<T>): input is T {
  return input !== null;
}

export type Cls<T> = { new(...args: any[]): T };

export type EnumKey<T extends object> = keyof T;
export type EnumValue<T extends object> = T[EnumKey<T>];
