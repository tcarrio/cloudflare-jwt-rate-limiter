export type Result<T> = Found<T> | NotFound;

export interface Found<T> {
  index: number;
  value: T;
}

export interface NotFound {
  lower: number;
  upper: number;
}

export function isFound<T>(input: Result<T>): input is Found<T> {
  return (
    typeof (input as Found<T>).index === 'number' &&
    // value is not reliable as T could be `null`
    typeof (input as NotFound).lower === 'undefined' &&
    typeof (input as NotFound).upper === 'undefined'
  );
}
