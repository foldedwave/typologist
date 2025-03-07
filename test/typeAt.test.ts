import { describe, it } from '@jest/globals';
import { expectType, TypeEqual } from 'ts-expect';
import { TypeAt } from '../src';
import {
  Company,
  Dictionary,
  TType,
  AmbiguousType,
  SimpleType,
  NestedType,
  TestComplexArrayType,
  TestOptionalArrayType,
  TestDictionaryType,
  TestUnionFirstType,
  TestEdgeCases,
  TestKeyType,
  TestArrayType,
  TestNumericKeyType,
  TestDictionaryValueType,
  TestNestedInnerType,
  TestNestedInnerArrayType,
  TestNestedType,
  TestOptionalType,
  TestOptionalNestedType,
  TestUnionSecondType,
  TestUnionThirdType,
  TestUnionNestedFirstType,
  TestUnionNestedSecondType,
  TestUnionNestedThirdType,
  ReadonlyType,
  GenericType,
  TupleType,
  IntersectionType,
  RecursiveType
} from './types/typeAtTestTypes';

describe('TypeAt', () => {
  describe('handler type checking', () => {
    function handler<T, K extends string | number>(
      _value: TypeAt<T, K>
    ) {}

    it('should compile when correctly typed', () => {
      handler<Company, 'name'>('test');
    });

    it('should not compile when incorrectly typed', () => {
      // @ts-expect-error - wrong type
      handler<Company, 'name'>(() => 'test');
      // @ts-expect-error - wrong type
      handler<Company, 'name'>({});
      // @ts-expect-error - wrong type
      handler<Company, 'name'>(123);
    });
  });

  describe('basic type testing', () => {
    it('should handle simple properties', () => {
      expectType<TypeEqual<TypeAt<TType, 'prop'>, TestKeyType>>(true);
    });

    it('should handle array properties', () => {
      expectType<TypeEqual<TypeAt<TType, 'arr'>, TestArrayType[]>>(true);
    });

    it('should handle numeric properties', () => {
      expectType<TypeEqual<TypeAt<TType, 123>, TestNumericKeyType>>(true);
    });

    it('should handle dictionary properties', () => {
      type DictResult = TypeAt<Dictionary, 'foo'>;
      expectType<TypeEqual<DictResult, TestDictionaryValueType>>(true);
    });

    it('should handle nested dictionary properties', () => {
      expectType<TypeEqual<TypeAt<Dictionary, 'foo.inner'>, TestNestedInnerType>>(true);
      expectType<TypeEqual<TypeAt<Dictionary, 'foo.arrayInner'>, TestNestedInnerArrayType[]>>(true);
      expectType<TypeEqual<TypeAt<Dictionary, 'foo.arrayInner[0]'>, TestNestedInnerArrayType>>(true);
    });
  });

  describe('nested structures', () => {
    it('should handle nested object properties', () => {
      expectType<TypeEqual<TypeAt<TType, 'nested'>, TestNestedType>>(true);
      expectType<TypeEqual<TypeAt<TType, 'nested.inner'>, TestNestedInnerType>>(true);
    });

    it('should handle array access', () => {
      expectType<TypeEqual<TypeAt<TType, 'arr[0]'>, TestArrayType>>(true);
      expectType<TypeEqual<TypeAt<TType, 'nested.arrayInner[0]'>, TestNestedInnerArrayType>>(true);
    });

    it('should handle optional properties', () => {
      expectType<TypeEqual<TypeAt<TType, 'opt'>, TestOptionalType>>(true);
      expectType<TypeEqual<TypeAt<TType, 'opt.prop'>, TestOptionalNestedType>>(true);
    });

    it('should handle union properties', () => {
      type Result = TypeAt<TType, 'union'>;
      type Expected = TestUnionFirstType | TestUnionSecondType | TestUnionThirdType;
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle nested union properties', () => {
      expectType<TypeEqual<TypeAt<TType, 'union.prop'>, TestUnionNestedFirstType>>(true);
      type OtherResult = TypeAt<TType, 'union.other'>;
      type OtherExpected = TestUnionNestedSecondType | TestUnionNestedThirdType;
      expectType<TypeEqual<OtherResult, OtherExpected>>(true);
    });
  });

  describe('complex types', () => {
    it('should handle optional array access', () => {
      expectType<TypeEqual<TypeAt<TestOptionalArrayType, 'optionalArray[0]'>, string>>(true);
    });

    it('should handle optional mixed array access', () => {
      expectType<TypeEqual<TypeAt<TestComplexArrayType, 'optionalMixedArray[0]'>, string | number>>(true);
    });

    it('should handle deep array property access', () => {
      expectType<TypeEqual<TypeAt<TestOptionalArrayType, 'deepArray[0].value'>, string>>(true);
    });

    it('should handle optional deep array property access', () => {
      expectType<TypeEqual<TypeAt<TestOptionalArrayType, 'optionalDeepArray[0].value'>, string>>(true);
    });

    it('should handle recursive array access', () => {
      expectType<TypeEqual<TypeAt<TestComplexArrayType, 'recursiveArray[0][0]'>, string>>(true);
    });

    it('should handle dictionary types', () => {
      type Result = TypeAt<TestDictionaryType, 'dictionary'>;
      type Expected = { [key: string]: number };
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should handle optional dictionary types', () => {
      type Result = TypeAt<TestDictionaryType, 'optionalDictionary'>;
      type Expected = { [key: string]: number };
      expectType<TypeEqual<Result, Expected>>(true);
    });
  });

  describe('edge cases', () => {
    it('should handle nullable optional properties', () => {
      expectType<TypeEqual<TypeAt<TestEdgeCases, 'nullableOptional'>, string | null>>(true);
    });

    it('should handle explicit undefined properties', () => {
      expectType<TypeEqual<TypeAt<TestEdgeCases, 'undefinedExplicit'>, string | undefined>>(true);
    });

    it('should handle multiple optional nested properties', () => {
      expectType<TypeEqual<TypeAt<TestEdgeCases, 'multiOptional.nested.value'>, string>>(true);
    });

    it('should handle direct array access', () => {
      expectType<TypeEqual<TypeAt<string[], '[0]'>, string>>(true);
    });

    it('should handle ambiguous paths', () => {
      type DotPath = TypeAt<AmbiguousType, 'a.b.c'>;
      type SpecialPath = TypeAt<AmbiguousType, 'a.b'>;
      
      expectType<TypeEqual<DotPath, number>>(true);
      expectType<TypeEqual<SpecialPath, { c: string }>>(true);
    });
  });

  describe('advanced types', () => {
    it('should handle readonly types', () => {
      expectType<TypeEqual<TypeAt<ReadonlyType, 'id'>, number>>(true);
      expectType<TypeEqual<TypeAt<ReadonlyType, 'nested.value'>, string>>(true);
      expectType<TypeEqual<TypeAt<ReadonlyType, 'mutable.value'>, number>>(true);
    });

    it('should handle generic types', () => {
      type StringGeneric = GenericType<string>;
      expectType<TypeEqual<TypeAt<StringGeneric, 'data'>, string>>(true);
      expectType<TypeEqual<TypeAt<StringGeneric, 'metadata.type'>, string>>(true);
      expectType<TypeEqual<TypeAt<StringGeneric, 'metadata.modified'>, Date>>(true);
    });

    it('should handle tuple types', () => {
      expectType<TypeEqual<TypeAt<TupleType, 'coordinates[0]'>, number>>(true);
      expectType<TypeEqual<TypeAt<TupleType, 'range[0]'>, Date>>(true);
      expectType<TypeEqual<TypeAt<TupleType, 'mixed.1.x'>, number>>(true);
      expectType<TypeEqual<TypeAt<TupleType, 'mixed.2'>, number[]>>(true);
    });

    it('should handle intersection types', () => {
      expectType<TypeEqual<TypeAt<IntersectionType, 'id'>, number>>(true);
      expectType<TypeEqual<TypeAt<IntersectionType, 'created'>, Date>>(true);
      expectType<TypeEqual<TypeAt<IntersectionType, 'metadata.tags'>, string[]>>(true);
      expectType<TypeEqual<TypeAt<IntersectionType, 'metadata.tags[0]'>, string>>(true);
    });

    it('should handle recursive types', () => {
      type Result = TypeAt<RecursiveType, 'name'>;
      expectType<TypeEqual<Result, string>>(true);

      type ChildResult = TypeAt<RecursiveType, 'children[0].name'>;
      expectType<TypeEqual<ChildResult, string>>(true);

      type DeepChildResult = TypeAt<RecursiveType, 'children[0].children[0].name'>;
      expectType<TypeEqual<DeepChildResult, string>>(true);
    });
  });
  
  describe('runtime type checking', () => {
    it('should correctly type simple values', () => {
      type NameType = TypeAt<SimpleType, 'name'>;
      type AgeType = TypeAt<SimpleType, 'age'>;
      
      expectType<TypeEqual<NameType, string>>(true);
      expectType<TypeEqual<AgeType, number>>(true);
    });

    it('should correctly type nested values', () => {
      type FirstNameType = TypeAt<NestedType, 'user.profile.firstName'>;
      type ThemeType = TypeAt<NestedType, 'user.settings.theme'>;
      type SimpleNameType = TypeAt<NestedType, 'user.simple.name'>;
      type CreatedAtType = TypeAt<NestedType, 'metadata.createdAt'>;

      expectType<TypeEqual<FirstNameType, string>>(true);
      expectType<TypeEqual<ThemeType, string>>(true);
      expectType<TypeEqual<SimpleNameType, string>>(true);
      expectType<TypeEqual<CreatedAtType, Date>>(true);
    });
  });

  describe('TypeAt with complex array edge cases', () => {
    // Define some test types
    type Item = {
      id: number;
      name: string;
      optional?: string;
      nested: {
        value: boolean;
      };
    };
  
    // Edge case 1: Array of unions
    type UnionArray = (Item | { code: string })[];
  
    // Edge case 2: Optional array
    type OptionalArray = Item[] | undefined;
  
    // Edge case 3: Array with optional elements
    type ArrayWithOptionalElements = (Item | undefined)[];
  
    // Edge case 4: Deeply nested array paths
    type DeepArray = {
      level1: {
        level2: {
          items: Item[]
        }
      }
    }[];
  
    // Edge case 5: Array with index signatures
    type DictionaryInArray = { [key: string]: number }[];
  
    it('should handle arrays of union types', () => {
      type Result1 = TypeAt<UnionArray, '[0].id'>;
      type Result2 = TypeAt<UnionArray, '[0].code'>;
    
      // Should extract common fields from union
      expectType<TypeEqual<Result1, number>>(true);
      expectType<TypeEqual<Result2, string>>(true);
    });
  
    it('should handle optional arrays', () => {
      type Result = TypeAt<OptionalArray, '[0].name'>;
    
      // Should resolve to the type without the undefined part
      expectType<TypeEqual<Result, string>>(true);
    });
  
    it('should handle arrays with optional elements', () => {
      type Result = TypeAt<ArrayWithOptionalElements, '[0].name'>;
    
      // Should handle that the element might be undefined
      expectType<TypeEqual<Result, string>>(true);
    });
  
    it('should handle deeply nested array paths', () => {
      type Result1 = TypeAt<DeepArray, '[0].level1.level2.items[0].name'>;
      type Result2 = TypeAt<DeepArray, '[0].level1.level2.items[0].nested.value'>;
    
      // Should correctly navigate deep paths
      expectType<TypeEqual<Result1, string>>(true);
      expectType<TypeEqual<Result2, boolean>>(true);
    });
  
    it('should handle dictionary types in arrays', () => {
      type Result = TypeAt<DictionaryInArray, '[0].someKey'>;
    
      // Should handle index signature access
      expectType<TypeEqual<Result, number>>(true);
    });
  
    it('should handle numeric indices in complex nested structures', () => {
      // This is a particularly tricky case
      type ComplexType = {
        items: (string | number)[][];
      }[];
    
      type Result = TypeAt<ComplexType, '[0].items[1][2]'>;
    
      // Should correctly resolve nested array indices
      expectType<TypeEqual<Result, string | number>>(true);
    });
  });
});
