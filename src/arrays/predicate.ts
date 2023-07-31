import { assert } from "../assertions";
import { Order } from "./types";

/**
 * A standard predicate returns whether the given input is greater
 * than, less than, or equal to the comparator by returning a positive,
 * negative, or zero respectively.
 */
export type StandardPredicate<T> = (item: T) => number;

/**
 * An OrderedPredicate returns whether the given input is greater than,
 * less than, or equal to the comparator using the Order enumerator
 */
export type OrderedPredicate<T> = (item: T) => Order;

export type Predicate<T> = StandardPredicate<T> | OrderedPredicate<T>;

export function normalizeComparison<T>(
  predicate: StandardPredicate<T>,
): OrderedPredicate<T> {
  return (item: T) => {
    const result = predicate(item);

    assert(typeof result === 'number', 'Predicate must return a number!');

    if (result > 0) {
      return Order.GT;
    }
    if (result < 0) {
      return Order.LT;
    }
    return Order.EQ;
  };
}

