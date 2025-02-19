# Typologist

Type-safe path-based property access for TypeScript.

## Installation

```bash
npm install typologist
```

## Usage

```typescript
import { Paths, TypeAt } from 'typologist';

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
// 'profile' | 'profile.name' | 'profile.age' | 'profile.addresses' | 'profile.addresses[0]' | 'profile.addresses[0].street' | ...

// Get type at specific path
type NameType = TypeAt<User, 'profile.name'>; // string
type AddressType = TypeAt<User, 'profile.addresses[0]'>; // { street: string; city: string; }
```

## Features

- Full type safety for nested property access
- Support for arrays and optional properties
- Deep path type inference
- Zero runtime overhead (types only)

## License

MIT
