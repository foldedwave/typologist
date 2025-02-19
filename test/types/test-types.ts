/**
 * Test type definitions for the Paths type utility
 */

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

export type NumericPropertyType = {
  123: Number;
  nested: {
    123: string;
  }
  nestedType: SimpleType;
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

export type MixedArrayType = {
  matrixtwo: (number | string)[][];
  matrixthree: (number | string)[][][];
  matrixfour: (number | string)[][][][];
  mixed: (string | {
    id: number;
    value: string;
  })[];
};

export type RecordType = {
  users: Record<string, {
    name: string;
    role: string;
  }>;
  settings: Record<string, boolean>;
};

export type DeepType = {
  a: {
    b: {
      c: {
        d: {
          e: {
            f: string;
          };
        };
      };
    };
  };
};

export interface CircularType {
  name: string;
  child?: CircularType;
}

export type ComplexUnionType = {
  type: 'a';
  value: string;
} | {
  type: 'b';
  values: string[];
} | {
  type: 'c';
  nested: {
    value: number;
  };
};
