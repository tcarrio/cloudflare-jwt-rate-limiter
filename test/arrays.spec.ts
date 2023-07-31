import { Found, isFound, nearestCeil } from '../src/arrays';

describe('Arrays', () => {
  const array = [1, 3, 5, 7, 9, 11, 13, 15];
  const NOT_FOUND = {lower: 0, upper: 0} as const;
  it.each([
    { search: 18, array, expected: NOT_FOUND},
    { search: 17, array, expected: NOT_FOUND},
    { search: 16, array, expected: NOT_FOUND},
    { search: 15, array, expected: { index: 7, value: 15}},
    { search: 14, array, expected: { index: 7, value: 15}},
    { search: 13, array, expected: { index: 6, value: 13}},
    { search: 12, array, expected: { index: 6, value: 13}},
    { search: 11, array, expected: { index: 5, value: 11}},
    { search: 10, array, expected: { index: 5, value: 11}},
    { search: 9, array, expected: { index: 4, value: 9}},
    { search: 8, array, expected: { index: 4, value: 9}},
    { search: 7, array, expected: { index: 3, value: 7}},
    { search: 6, array, expected: { index: 3, value: 7}},
    { search: 5, array, expected: { index: 2, value: 5}},
    { search: 4, array, expected: { index: 2, value: 5}},
    { search: 3, array, expected: { index: 1, value: 3}},
    { search: 2, array, expected: { index: 1, value: 3}},
    { search: 1, array, expected: { index: 0, value: 1}},
    { search: 0, array, expected: { index: 0, value: 1}},
    { search: -1, array, expected: { index: 0, value: 1}},
    { search: -2, array, expected: { index: 0, value: 1}},
  ])(
    'should return $expected given search $search and array $array',
    ({search, array, expected}) => {
      const actual = nearestCeil(array, (item: number) => search - item) as Found<number>;

      if (isFound(expected)) {
        expect(actual).toEqual(expected);
      } else {
        expect(isFound(actual)).toBe(false);
      }
    },
  );
});
