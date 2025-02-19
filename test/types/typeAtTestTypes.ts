// Base test types
export class Company {
  name: string;
  description: string;
  createdAt: Date = new Date();

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}

// Test utility types
export type TestKeyType = {} | "KeyType";
export type TestArrayType = {} | "ArrayType";
export type TestNumericKeyType = {} | "NumericKeyType";
export type TestNestedInnerType = {} | "NestedInnerType";
export type TestNestedInnerArrayType = {} | "NestedInnerArrayType";
export type TestNestedType = {
  inner: TestNestedInnerType;
  arrayInner: TestNestedInnerArrayType[];
};
export type TestOptionalType = {
  prop: TestOptionalNestedType;
};
export type TestOptionalNestedType = {} | "OptionalType";
export type TestUnionNestedFirstType = {} | "UnionFirstType";
export type TestUnionNestedSecondType = {} | "UnionSecondType";
export type TestUnionNestedThirdType = {} | "UnionThirdType";
export type TestUnionFirstType = {
  prop: TestUnionNestedFirstType;
};
export type TestUnionSecondType = {
  other: TestUnionNestedSecondType;
};
export type TestUnionThirdType = {
  other: TestUnionNestedThirdType;
};
export type TestDictionaryValueType = {
  inner: TestNestedInnerType;
  arrayInner: TestNestedInnerArrayType[];
};

// Main test type
export type TType = {
  prop: TestKeyType;
  arr: TestArrayType[];
  123: TestNumericKeyType;
  nested: TestNestedType;
  opt?: TestOptionalType;
  union: TestUnionFirstType | TestUnionSecondType | TestUnionThirdType;
  nestedunion: {
    union: TestUnionFirstType | TestUnionSecondType | TestUnionThirdType;
  };
};

// Dictionary test type
export type Dictionary = {
  [key: string]: TestDictionaryValueType;
};

// Additional test types
export type SimpleType = {
  name: string;
  age: number;
  123: string;
};

export type NestedType = {
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
    settings: {
      theme: string;
    };
    simple: SimpleType;
  };
  metadata: {
    createdAt: Date;
  };
};

export type ArrayType = {
  items: {
    id: number;
    tags: string[];
  }[];
};

export type OptionalType = {
  required: string;
  optional?: {
    value: string;
    nested?: {
      deep: number;
    };
  };
};

export type UnionType = {
  status: 'active' | 'inactive';
  data: {
    type: 'user' | 'admin';
    permissions: string[];
  } | {
    type: 'guest';
    expiresAt: Date;
  };
};

export type BaseType = {
  id: number;
  created: Date;
};

export type ExtraType = {
  metadata: {
    tags: string[];
  };
};

export type IntersectionType = BaseType & ExtraType;

export type RecordType = {
  users: Record<string, {
    name: string;
    role: string;
  }>;
  settings: Record<string, boolean>;
};

export type RecursiveType = {
  name: string;
  children?: RecursiveType[];
};

export type MixedArrayType = {
  matrixtwo: (number | string)[][];
  matrixthree: (number | string)[][][];
  matrixfour: (number | string)[][][][];
  mixed: (string | {
    id: number;
    value: string;
  })[];
};

export type ReadonlyType = {
  readonly id: number;
  readonly nested: {
    readonly value: string;
  };
  mutable: {
    value: number;
  };
};

export type GenericType<T> = {
  data: T;
  metadata: {
    type: string;
    modified: Date;
  };
};

export type TupleType = {
  coordinates: [number, number];
  range: [start: Date, end: Date];
  mixed: [string, { x: number }, number[]];
};

// Edge case test types
export interface TestOptionalArrayType {
  optionalArray?: string[];
  deepArray: { value: string }[];
  optionalDeepArray?: { value: string }[];
}

export interface TestDictionaryType {
  dictionary: { [key: string]: number };
  optionalDictionary?: { [key: string]: number };
}

export interface TestComplexArrayType {
  mixedArray: (string | number)[];
  optionalMixedArray?: (string | number)[];
  recursiveArray?: string[][];
}

export interface TestEdgeCases {
  nullableOptional?: string | null;
  undefinedExplicit: string | undefined;
  multiOptional?: {
    nested?: {
      value?: string;
    };
  };
}

export type AmbiguousType = {
  'a.b': {
    c: string;
  };
  a: {
    b: {
      c: number;
    };
  };
};
