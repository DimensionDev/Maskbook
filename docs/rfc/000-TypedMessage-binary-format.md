# TypedMessage binary format

## Motivation

Currently Mask only support text payload + metadata.

## Design target

- Must be a binary format.
- Must be compatible with both future and past. (Old client can parse the extended TypedMessage payload though may not be able to use it. New client can parse the old payload).

## Design

### `Document` type

This is the top-most data type.

```typescript
type Document = [version: 1, constantTable: UTF8String[], message: TupleFormatOf<TypedMessage>]
```

Use [msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md) to compress the `Document` into a binary format.

### TypedMessage

All TypedMessage must starts with the following format:

```typescript
type TypedMessageTupleBase = [
  type: TypedMessageTypeEnum | string,
  // Every TypedMessage can store metadata
  metadata: object | null,
  ...rest: any[]
]
enum TypedMessageTypeEnum {
  Text = 0,
}
```

### Text

TBD
