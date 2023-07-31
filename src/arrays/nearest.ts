import { binarySearch } from "./binary-search";
import { Result, isFound } from "./result";

const { min, max } = Math;

type Min = typeof min;
type Max = typeof max;

export function nearest<T extends Array<U>, U>(
    array: Readonly<T>,
    predicate: (item: U) => number,
    lower: number = 0,
    upper: number = array.length - 1,
    fn: Min | Max,
  ): Result<U> {
    const result = binarySearch(array, predicate, lower, upper);
  
    if (isFound(result)) {
      return result;
    }
  
    const index = fn(result.lower, result.upper);
  
    if (index < lower || index > upper) {
      return {
        lower,
        upper,
      };
    }
  
    return {
      index,
      value: array[index],
    };
  }
  
  export function nearestCeil<T extends Array<U>, U>(
    array: Readonly<T>,
    predicate: (item: U) => number,
    lower: number = 0,
    upper: number = array.length - 1,
  ): Result<U> {
    return nearest(array, predicate, lower, upper, max);
  }
  
  export function nearestFloor<T extends Array<U>, U>(
    array: Readonly<T>,
    predicate: (item: U) => number,
    lower: number = 0,
    upper: number = array.length - 1,
  ): Result<U> {
    return nearest(array, predicate, lower, upper, min);
  }