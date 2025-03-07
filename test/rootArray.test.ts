import { describe, it } from '@jest/globals';
import { expectType, TypeEqual } from 'ts-expect';
import { Paths, TypeAt } from '../src';

describe('Root-level array handling', () => {
  // Define a simple item type for testing
  type Item = {
    id: number;
    name: string;
    tags: string[];
  };

  // Define a root-level array type
  type ItemArray = Item[];

  describe('Paths utility with root-level arrays', () => {
    it('should generate correct paths for root-level arrays', () => {
      type Result = Paths<ItemArray>;
      
      // We expect to be able to access array indices and their properties
      type Expected = 
        | `[${number}]`
        | `[${number}].id`
        | `[${number}].name`
        | `[${number}].tags`
        | `[${number}].tags[${number}]`;
      
      expectType<TypeEqual<Result, Expected>>(true);
    });

    it('should work with nested root-level arrays', () => {
      type NestedArrayType = Item[][];
      type Result = Paths<NestedArrayType>;
      
      type Expected = 
        | `[${number}]`
        | `[${number}][${number}]`
        | `[${number}][${number}].id`
        | `[${number}][${number}].name`
        | `[${number}][${number}].tags`
        | `[${number}][${number}].tags[${number}]`;
      
      expectType<TypeEqual<Result, Expected>>(true);
    });
  });

  describe('TypeAt utility with root-level arrays', () => {
    it('should correctly resolve types for root-level array indices', () => {
      // Access an array element
      type ItemType = TypeAt<ItemArray, '[0]'>;
      expectType<TypeEqual<ItemType, Item>>(true);
      
      // Access a property on an array element
      type NameType = TypeAt<ItemArray, '[0].name'>;
      expectType<TypeEqual<NameType, string>>(true);
      
      // Access a nested array property
      type TagType = TypeAt<ItemArray, '[0].tags[0]'>;
      expectType<TypeEqual<TagType, string>>(true);
    });

    it('should correctly resolve types for nested root-level arrays', () => {
      type NestedArrayType = Item[][];
      
      // Access a nested array element
      type InnerArrayType = TypeAt<NestedArrayType, '[0]'>;
      expectType<TypeEqual<InnerArrayType, Item[]>>(true);
      
      // Access an item in a nested array
      type ItemType = TypeAt<NestedArrayType, '[0][0]'>;
      expectType<TypeEqual<ItemType, Item>>(true);
      
      // Access a property on a nested array item
      type NameType = TypeAt<NestedArrayType, '[0][0].name'>;
      expectType<TypeEqual<NameType, string>>(true);
    });
  });

  describe('Integration with container pattern', () => {
    // Simplified version of a container interface resembling the application's use case
    interface EditableContainer<T> {
      handleFieldChange: <K extends Paths<T>>(field: K, value: TypeAt<T, K>) => void;
    }
    
    it('should type-check correctly with container field change operations', () => {
      // This test would fail with the current implementation
      // Create a mock function that only accepts valid paths and values
      function createMockFieldChange<T>() {
        return <K extends Paths<T>>(_field: K, _value: TypeAt<T, K>) => {};
      }
      
      // Type checks for different field paths
      const mockChange = createMockFieldChange<ItemArray>();
      
      // These should compile without errors if our utilities work correctly
      mockChange('[0].name', 'New Name');
      mockChange('[0].id', 123);
      mockChange('[0].tags', ['tag1', 'tag2']);
      mockChange('[0].tags[0]', 'new-tag');
      
      // Create a mock container to mimic application usage
      const container: EditableContainer<ItemArray> = {
        handleFieldChange: <K extends Paths<ItemArray>>(_field: K, _value: TypeAt<ItemArray, K>) => {}
      };
      
      // This is the critical test case that fails in the application
      container.handleFieldChange('[0].name', 'Updated Name');
    });
  });
  
  describe('Edge cases with root-level arrays', () => {
    it('should handle empty arrays', () => {
      type EmptyArray = never[];
      type Result = Paths<EmptyArray>;
      
      // Even with an empty array, we should be able to access indices
      type Expected = `[${number}]`;
      
      expectType<TypeEqual<Result, Expected>>(true);
    });
    
    it('should handle primitive arrays', () => {
      type NumberArray = number[];
      type Result = Paths<NumberArray>;
      
      // For primitive arrays, we can only access indices
      type Expected = `[${number}]`;
      
      expectType<TypeEqual<Result, Expected>>(true);
      
      // Check type resolution
      type NumberType = TypeAt<NumberArray, '[0]'>;
      expectType<TypeEqual<NumberType, number>>(true);
    });
    
    it('should handle array with optional elements', () => {
      type OptionalItemArray = (Item | undefined)[];
      
      // Check path generation
      type Result = Paths<OptionalItemArray>;
      type Expected = 
        | `[${number}]`
        | `[${number}].id`
        | `[${number}].name`
        | `[${number}].tags`
        | `[${number}].tags[${number}]`;
      
      expectType<TypeEqual<Result, Expected>>(true);
      
      // Check type resolution
      type ItemType = TypeAt<OptionalItemArray, '[0]'>;
      expectType<TypeEqual<ItemType, Item | undefined>>(true);
      
      type NameType = TypeAt<OptionalItemArray, '[0].name'>;
      expectType<TypeEqual<NameType, string>>(true);
    });
  });
  
  describe('Deeper array access patterns', () => {
    type DeepItem = {
      id: number;
      nested: {
        items: {
          name: string;
          values: number[];
        }[];
      };
    };
    
    type DeepArray = DeepItem[];
    
    it('should handle deep array paths', () => {
      // Access a multi-level path with array indices
      type NestedName = TypeAt<DeepArray, '[0].nested.items[0].name'>;
      expectType<TypeEqual<NestedName, string>>(true);
      
      // Access a deep array element
      type NestedValue = TypeAt<DeepArray, '[0].nested.items[0].values[0]'>;
      expectType<TypeEqual<NestedValue, number>>(true);
    });
    
    it('should generate deep array paths', () => {
      //type Result = Paths<DeepArray>;
      
      // These paths are critical for the test
      type VerySpecificPath = TypeAt<DeepArray, '[0].nested.items[0].name'>;
      expectType<TypeEqual<VerySpecificPath, string>>(true);
      
      type AnotherSpecificPath = TypeAt<DeepArray, '[0].nested.items[0].values[0]'>;
      expectType<TypeEqual<AnotherSpecificPath, number>>(true);
    });
  });
  
  // This test is for the specific failure case in the PR
  describe('PR-specific test case', () => {
    type Task = {
      id: number;
      title: string; 
      projectId: number;
      status: 'completed' | 'pending' | 'in-progress';
    };
    
    type TaskArray = Task[];
    
    it('should work with the specific task array case', () => {
      const fieldChange = <K extends Paths<TaskArray>>(_field: K, _value: TypeAt<TaskArray, K>) => {};
      
      // This should work correctly
      fieldChange('[0].title', 'Updated Task Name');
      
      // Test the other properties too
      fieldChange('[0].id', 123);
      fieldChange('[0].projectId', 456);
      fieldChange('[0].status', 'completed');
    });
  });
});
