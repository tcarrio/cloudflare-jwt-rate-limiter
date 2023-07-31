import { Predicate, normalizeComparison } from './predicate';
import { Result } from './result';
import { Order } from './types';

/**
 * @param predicate
 * @returns {Result<T>} a result indicating either the found result or not found
 */
export function binarySearch<T extends Array<U>, U>(
  array: Readonly<T>,
  predicate: Predicate<U>,
  lower: number = 0,
  upper: number = array.length - 1,
): Result<U> {
  predicate = normalizeComparison(predicate);

  // Iterate while start not meets end
  while (lower <= upper) {
    const middle = Math.floor((lower + upper) / 2);

    switch (predicate(array[middle])) {
      case Order.EQ:
        return {
          index: middle,
          value: array[middle],
        };

      case Order.GT:
        // Look in the right slice
        lower = middle + 1;
        break;

      case Order.LT:
        // Look in the left slice
        upper = middle - 1;
        break;

      default:
        throw new Error('Invalid Order value returned by predicate');
    }
  }

  return {
    lower,
    upper,
  };
}
