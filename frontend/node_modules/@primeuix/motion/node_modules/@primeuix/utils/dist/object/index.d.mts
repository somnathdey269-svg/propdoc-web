declare function compare<T = unknown>(value1: T, value2: T, comparator: (val1: T, val2: T) => number, order?: number): number;

declare function contains<T = unknown>(value: T, list: T[]): boolean;

declare function deepEquals(obj1: unknown, obj2: unknown): boolean;

/**
 * Deep-merges objects into a fresh object graph; inputs are never mutated and the result shares no
 * references with them. Arrays are replaced (not element-merged). Cyclic sources are handled.
 *
 * A reference shared within a single source object keeps its shared identity in the result, but only
 * when first reached against an empty slot; references shared across separate arguments are cloned
 * independently.
 * @param args - Objects to merge, left to right.
 * @returns Merged object.
 */
declare function deepMerge(...args: Record<string, unknown>[]): Record<string, unknown>;

declare function equals(obj1: unknown, obj2: unknown, field?: string): boolean;

declare function filter<T = unknown>(value: T[], fields: string[], filterValue: string): T[];

declare function findIndexInList<T = unknown>(value: T, list: T[]): number;

/**
 * Firefox-v103 does not currently support the "findLast" method. It is stated that this method will be supported with Firefox-v104.
 * https://caniuse.com/mdn-javascript_builtins_array_findlast
 */
declare function findLast<T = unknown>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): T | undefined;

/**
 * Firefox-v103 does not currently support the "findLastIndex" method. It is stated that this method will be supported with Firefox-v104.
 * https://caniuse.com/mdn-javascript_builtins_array_findlastindex
 */
declare function findLastIndex<T = unknown>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): number;

declare function getKeyValue<T extends Record<string, unknown>>(obj: T | undefined, key?: string, params?: unknown): unknown;

declare function insertIntoOrderedArray<T>(item: T, index: number, arr: T[], sourceArr: T[]): void;

declare function isArray(value: unknown): value is unknown[];
declare function isArray(value: unknown, empty?: boolean): boolean;

declare function isDate(value: unknown): value is Date;

declare function isEmpty(value: unknown): boolean;

declare function isFunction(value: unknown): value is (...args: unknown[]) => unknown;

declare function isLetter(char: string): boolean;

declare function isNotEmpty(value: unknown): boolean;

declare function isNumber(value: unknown): boolean;

declare function isObject(value: unknown, empty?: boolean): value is object;

declare function isPrintableCharacter(char?: string): boolean;

declare function isScalar(value: unknown): boolean;

declare function isString(value: unknown, empty?: boolean): value is string;

declare function localeComparator(): (val1: string, val2: string) => number;

declare function matchRegex(str: string, regex?: RegExp): boolean;

/**
 * @deprecated Use `deepMerge` instead.
 *
 * Merges multiple objects into one.
 * @param args - Objects to merge.
 * @returns Merged object.
 */
declare function mergeKeys(...args: Record<string, unknown>[]): Record<string, unknown>;

declare function minifyCSS(css?: string): string | undefined;

declare function nestedKeys(obj?: Record<string, unknown>, parentKey?: string): string[];

declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K>;
declare function omit(obj: unknown, ...keys: string[]): unknown;

declare function removeAccents(str: string): string;

declare function reorderArray<T>(value: T[], from: number, to: number): void;

declare function resolve<P extends unknown[], R>(obj: (...params: P) => R, ...params: P): R;
declare function resolve<T>(obj: T, ...params: unknown[]): Exclude<T, (...args: never[]) => unknown>;

declare function resolveFieldData(data: any, field: any): any;

/**
 * Shallow equal for React/Vue props comparison
 * Ignores functions (common in props)
 */
declare function shallowEqualProps(propsA: Record<string, unknown>, propsB: Record<string, unknown>): boolean;

/**
 * Checks if two values are shallowly equal
 * - Primitives: compared by value (===)
 * - Objects/Arrays: compared by reference and first-level properties
 *
 * @param objA - First value to compare
 * @param objB - Second value to compare
 * @returns True if values are shallowly equal, false otherwise
 *
 * @example
 * shallowEquals(1, 1) // true
 * shallowEquals('a', 'a') // true
 * shallowEquals({ a: 1 }, { a: 1 }) // true (shallow)
 * shallowEquals({ a: { b: 1 } }, { a: { b: 1 } }) // false (nested objects are different references)
 * shallowEquals([1, 2], [1, 2]) // true (shallow)
 * shallowEquals([1, [2]], [1, [2]]) // false (nested arrays are different references)
 */
declare function shallowEquals(objA: unknown, objB: unknown): boolean;

declare function sort<T>(value1: T, value2: T, order: number | undefined, comparator: (val1: T, val2: T) => number, nullSortOrder?: number): number;

declare function stringify(value: unknown, indent?: number, currentIndent?: number): string;

declare function toCamelCase(str: string): string;

declare function toCapitalCase(str: string): string;

declare function toFlatCase(str: string): string;

declare function toKebabCase(str: string): string;

declare function toMs(value: string | number): number;

declare function toTokenKey(str: string): string;

/**
 * Resolves the underlying value from various wrapper patterns
 * Supports React refs, Vue refs, Lit directives, Angular signals, and direct values/functions
 * @param value - The value to resolve
 */
declare function toValue(value: unknown): unknown;

export { compare, contains, deepEquals, deepMerge, equals, filter, findIndexInList, findLast, findLastIndex, getKeyValue, insertIntoOrderedArray, isArray, isDate, isEmpty, isFunction, isLetter, isNotEmpty, isNumber, isObject, isPrintableCharacter, isScalar, isString, localeComparator, matchRegex, mergeKeys, minifyCSS, nestedKeys, omit, removeAccents, reorderArray, resolve, resolveFieldData, shallowEqualProps, shallowEquals, sort, stringify, toCamelCase, toCapitalCase, toFlatCase, toKebabCase, toMs, toTokenKey, toValue };
