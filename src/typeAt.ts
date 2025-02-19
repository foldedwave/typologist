/**
 * A TypeScript type system for type-safe property access at any depth in an object type.
 * Provides static type checking and autocompletion for accessing nested properties using 
 * string literal paths. Supports accessing properties through objects, arrays, dictionaries,
 * optional properties, and tuples.
 */

/**
 * Internal utility to handle optional and nullable types by converting them to their non-optional,
 * non-null equivalents. Preserves array types as-is.
 */
type Normalize<T> = T extends readonly any[]
  ? T
  : T extends object
    ? { [K in keyof T]-?: NonNullable<T[K]> }
    : T;

/**
 * Internal utility to flatten intersection types into a single object type to expose
 * all properties directly on the resulting type.
 */
type Merged<T> = { [K in keyof T]: T[K] } & {};

/**
 * Internal utility that combines normalization and intersection flattening to get
 * the exact type for a given key.
 */
type ExactType<T, K extends string | number> = 
  T extends { [P in K]: any }
    ? Normalize<Merged<T[K]>>
    : never;

/**
 * Internal check for explicitly defined keys in an object type.
 * Distinguishes between direct properties and index signatures.
 */
type IsExplicitKey<T, K extends string | number> = T extends { [P in K]: any }
  ? true
  : never;

/**
 * Internal utility to retrieve the type of an explicit key from an object type.
 */
type KeyType<T, K extends string | number> =
  T extends { [P in K]: any }
    ? K extends keyof T
      ? T[K]
      : never
    : never;

/**
 * Internal check for index signature matches. Returns true if the key matches an index
 * signature rather than an explicit property.
 */
type IsIndexKey<T, K extends string | number> =
K extends keyof T 
  ? IsExplicitKey<T, K> extends true 
    ? never 
    : true
  : never;

/**
 * Internal utility to get the type from an index signature for a given key.
 */
type IndexKeyType<T, K extends string | number> =
K extends keyof T 
  ? IsExplicitKey<T, K> extends true 
    ? never
    : ExactType<T, K>
  : never;

/**
 * Internal utility to extract the element type from an array type, handling both
 * definite and optional arrays.
 */
type ArrayElementType<T> = T extends (infer E)[] | undefined ? E : never;

/**
 * Internal check for array access patterns in a path.
 * Handles both direct array access and nested array properties.
 */
type IsArray<T, K> =
T extends any[]
  ? K extends `[${number}]${string}`
    ? true
    : never
  : K extends `${infer Base}[${number}]${string}`
    ? Base extends keyof T
      ? NonNullable<T[Base]> extends any[]
        ? true
        : never
      : never
    : never;

/**
 * Internal utility to resolve array access patterns and provide the correct type.
 * Handles array indexing and nested property access after array indexing.
 */
type ArrayType<T, K> =
T extends any[]
  ? K extends `[${number}]${infer Rest}`
    ? Rest extends ''
      ? Normalize<Merged<ArrayElementType<T>>>
      : Rest extends `.${infer NestedRest}`
        ? TypeAt<Normalize<Merged<ArrayElementType<T>>>, NestedRest>
        : TypeAt<Normalize<Merged<ArrayElementType<T>>>, Rest>
    : never
  : K extends `${infer Base}[${number}]${infer Rest}`
    ? Base extends keyof T
      ? NonNullable<T[Base]> extends any[]
        ? Rest extends ''
          ? Normalize<Merged<ArrayElementType<NonNullable<T[Base]>>>>
          : Rest extends `.${infer NestedRest}`
            ? TypeAt<Normalize<Merged<ArrayElementType<NonNullable<T[Base]>>>>, NestedRest>
            : TypeAt<Normalize<Merged<ArrayElementType<NonNullable<T[Base]>>>>, Rest>
        : never
      : never
    : never;

/**
 * Internal check for dictionary key access. Identifies paths accessing string index
 * signatures while excluding nested path accesses.
 */
type IsDictionaryKey<T, K extends string | number> = T extends { [key: string]: any }
  ? string extends keyof T
    ? K extends `${string}.${string}`
      ? never
      : true
    : never
  : never;

/**
 * Internal utility to get types from string index signatures, excluding nested paths.
 */
type DictionaryKeyType<T, K extends string | number> = T extends { [key: string]: any }
  ? string extends keyof T
    ? K extends `${string}.${string}`
      ? never
      : T[keyof T]
    : never
  :never;

/**
 * Internal check for nested property access through dot notation.
 */
type IsNestedKey<T, K> =
K extends `${infer I}.${string}`
  ? IsExplicitKey<T, I> extends true
    ? I extends keyof T
      ? T[I] extends object
        ? true
        : never
      : never
    : never
  : never;

/**
 * Internal utility to resolve nested property access patterns.
 */
type NestedKeyType<T, K> =
K extends `${infer I}.${infer Rest}`
  ? IsExplicitKey<T, I> extends true
    ? I extends keyof T
      ? T[I] extends object
        ? TypeAt<Normalize<Merged<T[I]>>, Rest>
        : never
      : never
    : never
  : never;

/**
 * Internal check for paths through optional properties.
 */
type IsOptionalKey<T, K extends string | number> =
K extends `${infer I}.${string}`
  ? I extends keyof T
    ? undefined extends T[I]
      ? Exclude<T[I], undefined> extends object
        ? true 
        : never
      : never
    : never
  : K extends keyof T
    ? undefined extends T[K]
      ? true
      : never
    : never;

/**
 * Internal utility to resolve types through optional property chains.
 */
type OptionalKeyType<T, K extends string | number> =
K extends `${infer I}.${infer Rest}`
  ? I extends keyof T
    ? undefined extends T[I]
      ? TypeAt<Exclude<T[I], undefined>, Rest>
      : never
    : never
  : K extends keyof T
    ? undefined extends T[K]
      ? Exclude<T[K], undefined>
      : never
    : never;

/**
 * Gets the type at a specific path in an object type.
 * Provides compile-time type checking for deep property access.
 * 
 * @template T - The object type to examine
 * @template K - The property access path
 * 
 * @example
 * type User = {
 *   profile: {
 *     name: string;
 *     addresses: { street: string }[];
 *   };
 *   settings?: {
 *     theme: "light" | "dark";
 *   };
 * }
 * 
 * type T1 = TypeAt<User, "profile.name"> // string
 * type T2 = TypeAt<User, "profile.addresses[0].street"> // string
 * type T3 = TypeAt<User, "settings.theme"> // "light" | "dark"
 */
export type TypeAt<T, K extends string | number> =
  IsExplicitKey<T, K> extends never
  ? IsIndexKey<T, K> extends never
    ? IsNestedKey<T, K> extends never
      ? IsArray<T, K> extends never
        ? IsDictionaryKey<T, K> extends never
          ? IsOptionalKey<T, K> extends never
            ? never
            : OptionalKeyType<T, K>
          : DictionaryKeyType<T, K>
        : ArrayType<T, K>
      : NestedKeyType<T, K>
    : IndexKeyType<T, K>
  : KeyType<T, K>;

/**
 * Utility type for debugging TypeAt results. Shows the intermediate steps of type resolution.
 */
//@ts-ignore
type DebugTypeAt<T, K extends string | number> = {
  __key: K;
  __isKey: IsExplicitKey<T, K>;
  __keyType: KeyType<T, K>;
  __isIndexKey: IsIndexKey<T, K>;
  __indexKeyType: IndexKeyType<T, K>;
  __isNestedKey: IsNestedKey<T, K>;
  __nestedKeyType: NestedKeyType<T, K>;
  __isArray: IsArray<T, K>;
  __arrayType: ArrayType<T, K>;
  __isDictionary: IsDictionaryKey<T, K>;
  __dictionaryType: DictionaryKeyType<T, K>;
  __isOptional: IsOptionalKey<T, K>;
  __optionalType: OptionalKeyType<T, K>;
};
