import { describe, it, expect } from '@jest/globals';
import { expectType } from "ts-expect";
import { get, set } from 'lodash';
import { Paths } from '../src';

describe('Integration Tests', () => {
  describe('lodash.get', () => {
    it('should support simple property access', () => {
      const obj = { name: 'test', age: 25 };
      type ObjType = typeof obj;
      const path: Paths<ObjType> = 'name';
      
      expectType<typeof path>('name')
      expect(get(obj, path)).toBe('test');
    });

    it('should support nested property access', () => {
      const obj = {
        user: {
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      };
      type ObjType = typeof obj;
      const path: Paths<ObjType> = 'user.profile.firstName';

      expect(get(obj, path)).toBe('John');
    });

    it('should support array access', () => {
      const obj = {
        items: [
          { id: 1, tags: ['a', 'b'] }
        ]
      };
      type ObjType = typeof obj;

      const path1: Paths<ObjType> = 'items[0]';
      const path2: Paths<ObjType> = 'items[0].tags[0]';

      expect(get(obj, path1)).toEqual({ id: 1, tags: ['a', 'b'] });
      expect(get(obj, path2)).toBe('a');
    });

    it('should handle undefined optional properties', () => {
      const obj: {
        required: string;
        optional?: {
          value: string;
          nested?: {
            deep: number;
          };
        };
      } = {
        required: 'exists'
      };

      const path1: Paths<typeof obj> = 'optional';
      const path2: Paths<typeof obj> = 'optional.value';
      const path3: Paths<typeof obj> = 'optional.nested.deep';

      expect(get(obj, path1)).toBeUndefined();
      expect(get(obj, path2)).toBeUndefined();
      expect(get(obj, path3)).toBeUndefined();
    });
  });

  describe('lodash.set', () => {
    it('should support simple property updates', () => {
      const obj = { name: 'test', age: 25 };
      type ObjType = typeof obj;
      const path: Paths<ObjType> = 'name';

      const newObj = set({ ...obj }, path, 'updated');
      expect(newObj.name).toBe('updated');
      // Original should be unchanged
      expect(obj.name).toBe('test');
    });

    it('should support nested property updates', () => {
      const obj = {
        user: {
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      };
      const path: Paths<typeof obj> = 'user.profile.firstName';
      expect(obj.user.profile.firstName).toBe('John');

      set({ ...obj }, path, 'Jane');
      expect(obj.user.profile.firstName).toBe('Jane');
    });

    it('should create intermediate objects for optional properties', () => {
      const obj: {
        optional?: {
          nested?: {
            value: string;
          };
        };
      } = {};

      const path: Paths<typeof obj> = 'optional.nested.value';
      
      const newObj = set({ ...obj }, path, 'created');
      expect(newObj.optional?.nested?.value).toBe('created');
    });
  });
});
