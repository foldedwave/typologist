import { describe, it } from '@jest/globals';
import { expectType, TypeEqual } from 'ts-expect';
import { 
  SimpleType, 
  NestedType, 
  ArrayType, 
  OptionalType, 
  RecordType,
  NumericPropertyType,
  UnionType,
  IntersectionType,
  MixedArrayType,
  DeepType,
  CircularType,
  ComplexUnionType
} from './types/test-types';
import { Paths } from '../src';

describe('Paths type', () => {
  describe('basic types', () => {
    it('should generate valid paths for simple objects', () => {
      type Result = Paths<SimpleType>;
      type Expected =
        | 'name'
        | 'age'
        | '123';
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle numeric property names', () => {
      type Result = Paths<NumericPropertyType>;
      type Expected = 
        | '123'
        | 'nested'
        | 'nested.123'
        | 'nestedType'
        | 'nestedType.123'
        | 'nestedType.name'
        | 'nestedType.age';
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle primitive types', () => {
      expectType<TypeEqual<Paths<string>, never>>(true);
      expectType<TypeEqual<Paths<number>, never>>(true);
      expectType<TypeEqual<Paths<boolean>, never>>(true);
      expectType<TypeEqual<Paths<null>, never>>(true);
      expectType<TypeEqual<Paths<undefined>, never>>(true);
    });
  });

  describe('nested structures', () => {
    it('should handle nested object properties', () => {
      type Result = Paths<NestedType>;
      type Expected = 
        | 'user'
        | 'user.profile'
        | 'user.profile.firstName'
        | 'user.profile.lastName'
        | 'user.settings'
        | 'user.settings.theme'
        | 'metadata'
        | 'metadata.createdAt';
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle array indexing and properties', () => {
      type Result = Paths<ArrayType>;
      type Expected = 
        | 'items'
        | `items[${number}]`
        | `items[${number}].id`
        | `items[${number}].tags`
        | `items[${number}].tags[${number}]`;
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle multi-dimensional arrays and mixed content', () => {
      type Result = Paths<MixedArrayType>;
      type Expected = 
        | 'matrixtwo'
        | `matrixtwo[${number}]`
        | `matrixtwo[${number}][${number}]`
        | 'matrixthree'
        | `matrixthree[${number}]`
        | `matrixthree[${number}][${number}]`
        | `matrixthree[${number}][${number}][${number}]`
        | 'matrixfour'
        | `matrixfour[${number}]`
        | `matrixfour[${number}][${number}]`
        | `matrixfour[${number}][${number}][${number}]`
        | `matrixfour[${number}][${number}][${number}][${number}]`
        | 'mixed'
        | `mixed[${number}]`
        | `mixed[${number}].id`
        | `mixed[${number}].value`;
      expectType<TypeEqual<Result, Expected>>(true);
    });
  });

  describe('special types', () => {
    it('should handle optional properties', () => {
      type Result = Paths<OptionalType>;
      type Expected = 
        | 'required'
        | 'optional'
        | 'optional.value'
        | 'optional.nested'
        | 'optional.nested.deep'
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle union types and discriminated unions', () => {
      type Result = Paths<UnionType>;
      type Expected = 
        | 'status'
        | 'data'
        | 'data.type'
        | 'data.permissions'
        | `data.permissions[${number}]`
        | 'data.expiresAt';
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle intersection types', () => {
      type Result = Paths<IntersectionType>;
      type Expected = 
        | 'id'
        | 'created'
        | 'metadata'
        | 'metadata.tags'
        | `metadata.tags[${number}]`;
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle Record<string, T> types', () => {
      type Result = Paths<RecordType>;
      type Expected = 
        | 'users'
        | `users.${string}`
        | `users.${string}.name`
        | `users.${string}.role`
        | 'settings'
        | `settings.${string}`;
      expectType<TypeEqual<Result, Expected>>(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      type EmptyType = {};
      expectType<TypeEqual<Paths<EmptyType>, never>>(true);
    });

    it('should handle null and undefined properties', () => {
      type NullableType = { 
        nullable: null | undefined;
        optNull?: null;
        optUndef?: undefined;
        strict: null;
        strictUndef: undefined;
      }; 
      type Result = Paths<NullableType>;
      type Expected =
        | 'nullable'
        | 'optNull'
        | 'optUndef'
        | 'strict'
        | 'strictUndef'
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle maximum depth recursion', () => {
      type Result = Paths<DeepType>;
      type Expected = 
        | 'a'
        | 'a.b'
        | 'a.b.c'
        | 'a.b.c.d'
        | 'a.b.c.d.e';
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle circular references', () => {
      type Result = Paths<CircularType>;
      type Expected = 
        | 'name'
        | 'child'
        | 'child.name'
        | 'child.child'
        | 'child.child.name'
        | 'child.child.child'
        | 'child.child.child.name'
        | 'child.child.child.child'
        | 'child.child.child.child.name'
        | 'child.child.child.child.child'
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle complex union types', () => {
      type Result = Paths<ComplexUnionType>;
      type Expected = 
        | 'type'
        | 'value'
        | 'values'
        | `values[${number}]`
        | 'nested'
        | 'nested.value';
      expectType<TypeEqual<Result, Expected>>(true);
    });
  });

  it('should handle arrays with terminal types', () => {
    type MixedTerminalArray = {
      dates: Date[];
      functions: (() => void)[];
      mixed: (Date | RegExp)[];
    };
    type Result = Paths<MixedTerminalArray>;
    type Expected = 
    | 'dates'
    | `dates[${number}]`
    | 'functions'
    | `functions[${number}]`
    | 'mixed'
    | `mixed[${number}]`;
    expectType<TypeEqual<Result, Expected>>(true);
  });

  it('should handle readonly properties', () => {
    type ReadonlyType = {
      readonly id: string;
      readonly user: {
        readonly name: string;
        age: number;
      };
    };
    type Result = Paths<ReadonlyType>;
    type Expected = 
    | 'id'
    | 'user'
    | 'user.name'
    | 'user.age';
    expectType<TypeEqual<Result, Expected>>(true);
  });

  it('should handle symbol keys appropriately', () => {
    const symbolKey = Symbol('test');
    type SymbolKeyType = {
      [symbolKey]: string;
      normalKey: string;
    };
    type Result = Paths<SymbolKeyType>;
    type Expected = 'normalKey';  // Symbol keys should be excluded
    expectType<TypeEqual<Result, Expected>>(true);
  });

  it('should handle generic types correctly', () => {
    type GenericType<T> = {
      value: T;
      wrapper: {
        inner: T;
      };
    };
    type Result = Paths<GenericType<string>>;
    type Expected = 
    | 'value'
    | 'wrapper'
    | 'wrapper.inner';
    expectType<TypeEqual<Result, Expected>>(true);
  });

  it('should handle never types appropriately', () => {
    type NeverType = {
      impossible: never;
      normal: string;
    };
    type Result = Paths<NeverType>;
    type Expected = 'impossible' | 'normal';
    expectType<TypeEqual<Result, Expected>>(true);
  });

  it('should handle arrays with different depths in same object', () => {
    type MixedDepthArrays = {
      simple: string[];
      nested: { value: string }[];
      deep: { arr: string[] }[];
    };
    type Result = Paths<MixedDepthArrays>;
    type Expected = 
    | 'simple'
    | `simple[${number}]`
    | 'nested'
    | `nested[${number}]`
    | `nested[${number}].value`
    | 'deep'
    | `deep[${number}]`
    | `deep[${number}].arr`
    | `deep[${number}].arr[${number}]`;
    expectType<TypeEqual<Result, Expected>>(true);
  });
});


describe('terminal types', () => {
  it('should handle built-in objects as terminal types', () => {
    type BuiltInType = {
      date: Date;
      regex: RegExp;
      func: () => void;
      promise: Promise<string>;
    };
    type Result = Paths<BuiltInType>;
    type Expected = 'date' | 'regex' | 'func' | 'promise';
    expectType<TypeEqual<Result, Expected>>(true);
  });
});
