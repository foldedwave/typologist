/**
 * Checks if a type is a "terminal" type that we shouldn't recurse into.
 * Terminal types include primitives and built-in objects that we want to treat as leaf nodes.
 * 
 * @template T - The type to check
 * @returns true if the type is terminal, false otherwise
 * 
 * @example
 * type T1 = IsTerminal<string>; // true
 * type T2 = IsTerminal<Date>; // true
 * type T3 = IsTerminal<{ a: string }>; // false
 */
type IsTerminal<T> = T extends string | number | boolean | Date | RegExp | Promise<any> | ((...args: any[]) => any)
  ? true
  : T extends Array<any>
    ? false
    : T extends object
      ? false
      : true;

/**
 * Maximum recursion depth for nested paths to prevent TypeScript from exceeding its recursion limit.
 */
type MaxDepth = 5;

/**
 * Helper type to decrease the depth counter using tuple indexing.
 * Using a tuple provides a type-safe way to subtract 1 from a number type.
 * 
 * @template D - The current depth number
 * @returns The depth minus 1
 */
type DecreaseDepth<D extends number> = [-1, 0, 1, 2, 3, 4, 5][D];

/**
 * Generates path segments for accessing elements in nested arrays.
 * For nested arrays, recursively builds path segments with array indexing.
 * 
 * @template T - The array type
 * @returns A string literal type representing valid array access paths
 * 
 * @example
 * type T1 = GetArrayPathSegments<number[]>; // '[0]'
 * type T2 = GetArrayPathSegments<number[][]>; // '[0]' | '[0][0]'
 */
type GetArrayPathSegments<T> = T extends (infer ArrayElement)[]
  ? `[${number}]` | (`[${number}]${GetArrayPathSegments<ArrayElement>}`)
  : '';

/**
 * Generates paths for accessing properties of array elements.
 * Handles nested property access on array elements, stopping at terminal types.
 * 
 * @template U - The array element type
 * @template D - The current recursion depth
 * @returns A string literal type representing valid property access paths on array elements
 * 
 * @example
 * type T = GetArrayElementPaths<{id: number}, 5>; // '[0].id'
 */
type GetArrayElementPaths<U, D extends number> = 
  U extends any[] ? never :
  U extends object 
    ? IsTerminal<U> extends true
      ? never
      : `[${number}].${Paths<U, D> & string}`
    : never;

/**
 * Generates all possible deep key paths for a type.
 * Supports array indexing, object properties, and dictionary (Record) types.
 * Handles optional properties and stops at terminal types.
 * 
 * @template T - The type to generate paths for
 * @template Depth - Maximum recursion depth (default: MaxDepth)
 * @returns A union of string literal types representing all valid paths
 * 
 * @example
 * type User = {
 *   name: string;
 *   profile: {
 *     age: number;
 *     addresses: {
 *       street: string;
 *     }[];
 *   };
 * };
 * 
 * type UserPaths = Paths<User>;
 * // 'name' | 'profile' | 'profile.age' | 'profile.addresses' |
 * // 'profile.addresses[0]' | 'profile.addresses[0].street'
 */
export type Paths<T, Depth extends number = MaxDepth> = Depth extends 0 
  ? never 
  : T extends object
    ? IsTerminal<T> extends true
      ? never
      : {
          [K in keyof T]-?: K extends string
            ? T[K] extends (infer ArrayElement)[] | undefined
              ? K 
                | `${K}${GetArrayPathSegments<T[K]>}` 
                | `${K}${GetArrayElementPaths<ArrayElement, Depth>}`
              : T[K] extends Record<string, infer V>
                ? string extends keyof T[K]
                  ? V extends object
                    ? K | `${K}.${string}` | `${K}.${string}.${Paths<V, DecreaseDepth<Depth>>}`
                    : K | `${K}.${string}` 
                  : K | `${K}.${Paths<T[K], DecreaseDepth<Depth>>}`
              : T[K] extends object | undefined
                ? K | `${K}.${Paths<Exclude<T[K], undefined>, DecreaseDepth<Depth>> & string}`
                : K
            : K extends number 
              ? `${K}`
              : never;
        }[keyof T]
    : never;
