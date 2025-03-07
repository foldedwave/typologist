# Typologist

Type-safe path-based property access for TypeScript.

![npm version](https://img.shields.io/npm/v/@foldedwave/typologist.svg)
![License](https://img.shields.io/github/license/foldedwave/typologist.svg)

## The Problem

Working with deeply nested data structures in TypeScript presents a challenge: how do you safely access nested properties using string paths?

Consider these common scenarios:
- You're using libraries like Lodash `get` or `set` that take string paths like `'user.profile.address.street'`
- You're building a form library where field names are represented as string paths
- You're creating a state management solution that needs to update nested properties

In all these cases, **string paths aren't type-checked by TypeScript**:
```typescript
// TypeScript doesn't detect these errors:
lodash.get(user, 'profile.addrses.street'); // Typo in 'addresses'
lodash.set(user, 'profile.age', 'thirty'); // Wrong type (string instead of number)
```

These path errors silently compile and only fail at runtime, leading to frustrating bugs.

## The Solution

Typologist provides complete type-safety for string-based property access:

```typescript
import { Paths, TypeAt } from '@foldedwave/typologist';

// Type-safe property access
function updateProperty<T, P extends Paths<T>>(
  obj: T, 
  path: P, 
  value: TypeAt<T, P> // Value type matches property type
): T {
  return set({...obj}, path, value);
}

// Now TypeScript catches these errors during development:
updateProperty(user, 'profile.addrses.street', '123'); // ❌ Error: Invalid path
updateProperty(user, 'profile.age', 'thirty');        // ❌ Error: Type 'string' not assignable to type 'number'
```

## Key Benefits

- **Catch errors early**: Find path typos and type mismatches during development, not in production
- **IDE autocompletion**: Get suggestions for valid paths as you type
- **Type-safety without verbosity**: Keep using simple string paths while getting full type checking
- **No runtime overhead**: Pure TypeScript types with zero impact on bundle size or performance
- **Works with existing libraries**: Seamless integration with Lodash, Immer, and other libraries that use string paths

## Installation

```bash
npm install @foldedwave/typologist
```

## Basic Usage

Typologist provides two main type utilities:

1. `Paths<T>` - Generates all valid property paths for a type
2. `TypeAt<T, P>` - Gets the type at a specific path in a type

Here's how you use them:

```typescript
import { Paths, TypeAt } from '@foldedwave/typologist';

type User = {
  profile: {
    name: string;
    age: number;
    addresses: {
      street: string;
      city: string;
    }[];
  };
  settings?: {
    theme: 'light' | 'dark';
  };
};

// Get all valid paths
type ValidPaths = Paths<User>;
// Type is: 'profile' | 'profile.name' | 'profile.age' | 'profile.addresses' 
// | 'profile.addresses[0]' | 'profile.addresses[0].street' | ...

// Get type at specific path
type NameType = TypeAt<User, 'profile.name'>; // string
type AddressType = TypeAt<User, 'profile.addresses[0]'>; // { street: string; city: string; }
type CityType = TypeAt<User, 'profile.addresses[0].city'>; // string
type ThemeType = TypeAt<User, 'settings.theme'>; // 'light' | 'dark'
```

## Moving Errors from Runtime to Compile Time

Without Typologist, path errors only get caught at runtime:

```typescript
// Without Typologist - No compile-time safety
import { get, set } from 'lodash';

function updateUser(user, path, value) {
  return set({...user}, path, value);
}

// These errors only show up at RUNTIME
updateUser(user, 'profile.nmae', 'Jane');  // Typo in path! ❌
updateUser(user, 'profile.addresses[0].postal', '10001'); // Non-existent field! ❌
```

With Typologist, these become compile-time errors:

```typescript
// With Typologist - Full compile-time safety
import { get, set } from 'lodash';
import { Paths, TypeAt } from '@foldedwave/typologist';

function updateUser<T, P extends Paths<T>>(
  user: T, 
  path: P, // Must be a valid path for type T
  value: TypeAt<T, P> // Value must match the type at the path
) {
  return set({...user}, path, value);
}

// These errors are caught at COMPILE TIME
updateUser(user, 'profile.nmae', 'Jane');  // TS Error: 'profile.nmae' is not assignable to Paths<User>
updateUser(user, 'profile.addresses[0].postal', '10001'); // TS Error: 'profile.addresses[0].postal' is not assignable to Paths<User>
updateUser(user, 'profile.name', 42); // TS Error: Argument of type 'number' is not assignable to parameter of type 'string'
```

## Advanced Examples

### 1. Type-Safe Property Updates with Lodash

```typescript
import { set } from 'lodash';
import { Paths, TypeAt } from '@foldedwave/typologist';

function updateProperty<T, P extends Paths<T>>(
  obj: T, 
  path: P, 
  value: TypeAt<T, P>
): T {
  return set({...obj}, path, value);
}

// Usage - fully type checked!
const user = { profile: { name: 'John' } };
updateProperty(user, 'profile.name', 'Jane'); // ✅ Works!
updateProperty(user, 'profile.nam', 'Jane');  // ❌ Compile error: Invalid path
updateProperty(user, 'profile.name', 42);     // ❌ Compile error: Wrong value type
```

### 2. Form Handling with Type Safety

```typescript
import { Paths, TypeAt } from '@foldedwave/typologist';

function createForm<T>() {
  return {
    getField<P extends Paths<T>>(path: P): { value: TypeAt<T, P> } {
      // Implementation
      return { value: null as any };
    },
    setField<P extends Paths<T>>(path: P, value: TypeAt<T, P>) {
      // Implementation
    }
  };
}

// Usage with a form
type UserForm = {
  name: string;
  age: number;
  preferences: { emailNotifications: boolean };
};

const userForm = createForm<UserForm>();
const nameField = userForm.getField('name'); // Type: { value: string }
userForm.setField('age', 30);                // ✅ Type safe!
userForm.setField('preferences.emailNotifications', true); // ✅ Type safe!
userForm.setField('age', 'thirty');          // ❌ Compile error: Wrong type
```

### 3. Type-Safe API Response Handling

```typescript
import { Paths, TypeAt } from '@foldedwave/typologist';

type ApiResponse = {
  data: {
    users: {
      id: number;
      profile: {
        email: string;
      }
    }[];
  };
  meta: {
    page: number;
    total: number;
  };
};

function selectData<P extends Paths<ApiResponse>>(path: P): TypeAt<ApiResponse, P> {
  // Implementation
  return null as any;
}

// All type-safe!
const users = selectData('data.users');              // Type: { id: number; profile: {...} }[]
const firstUserEmail = selectData('data.users[0].profile.email'); // Type: string
const page = selectData('meta.page');                // Type: number
```

## API Reference

### `TypeAt<T, P>`

Gets the type at the specified path `P` in the type `T`.

**Type Parameters:**
- `T` - The object type to extract from
- `P` - A string literal representing the path to a property

**Examples:**
```typescript
// Simple property
type A = TypeAt<{ a: string }, 'a'>;  // string

// Nested property
type B = TypeAt<{ a: { b: number } }, 'a.b'>;  // number

// Array access
type C = TypeAt<{ items: string[] }, 'items[0]'>;  // string

// Optional property
type D = TypeAt<{ a?: { b: boolean } }, 'a.b'>;  // boolean

// Array of numbers
type E = TypeAt<number[], '[0]'>;  // number

// Nested arrays
type F = TypeAt<number[][], '[0][0]'>;  // number
```

### `Paths<T>`

Generates a union type of all valid path strings for accessing properties in `T`.

**Type Parameters:**
- `T` - The object type to generate paths for

**Examples:**
```typescript
// Simple object
type SimplePaths = Paths<{ a: string; b: number }>;
// 'a' | 'b'

// Nested object
type NestedPaths = Paths<{ a: { b: string }; c: number }>;
// 'a' | 'a.b' | 'c'

// With arrays
type ArrayPaths = Paths<{ items: string[] }>;
// 'items' | 'items[0]'

// With optional properties
type OptionalPaths = Paths<{ a?: { b: string } }>;
// 'a' | 'a.b'
```

## Features

- ✅ **Compile-time safety** - Catch errors during development, not at runtime
- ✅ **Full type inference** - Correct TypeScript types for nested properties
- ✅ **Array support** - Access array elements with `[index]` syntax
- ✅ **Optional properties** - Safely access properties that might be undefined
- ✅ **Index signatures** - Support for dictionary-like objects (`Record<string, T>`)
- ✅ **Zero runtime cost** - Pure TypeScript type utilities with no runtime overhead
- ✅ **Integration ready** - Works with libraries like Lodash, Immer, etc.

## How It Works

Typologist uses TypeScript's advanced type system features including:

- Conditional types to handle different property access patterns
- Template literal types to parse and validate string paths
- Recursive type definitions to handle nested structures
- Tuple types for depth-limited recursion
- Type normalization to handle optional properties

## License

MIT
