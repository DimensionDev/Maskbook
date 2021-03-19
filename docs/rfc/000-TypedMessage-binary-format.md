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
type Document = [
  version: 1,
  // constant table is reversed for metadata
  // if the metadata key appears multiple times
  // in the whole payload, we can refer that key
  // by a index in the constant table.
  // Or maybe we should use a compress algorithm like gzip?
  constantTable: UTF8String[],
  message: TupleFormatOf<TypedMessage>,
]
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
  Compound = 0,
  Text = 1,
  Image = 2,
}
```

For unknown TypedMessage type, the client should ignore the content or render a TypedMessageUnknown hint.

### Compound

```typescript
type TypedMessageCompoundTuple = [
  type: TypedMessageTypeEnum.Compound
  metadata: object | null,
  // Ordered
  items: TypedMessageTuple[],
]
```

### Text

```typescript
type TypedMessageTextTuple = [
  type: TypedMessageTypeEnum.Text
  metadata: object | null,
  textType: TextType,
  content: string,
]
enum TextType {
  PlainText = 0,
  Markdown = 1
}
```

For unknown textType (might comes from the future version), the client must treat it as `TextType.PlainText`.

### Image

To limit the length of the payload, this data type is not going to support inline binary image data.

```typescript
type TypedMessageImageTuple = [
  type: TypedMessageTypeEnum.Image
  metadata: object | null,
  imageType: ImageType.PNG | ImageType.JPG | ImageType.WEBP,
  src: UTF8String,
  width: Int,
  height: Int
] | [
  type: TypedMessageTypeEnum.Image
  metadata: object | null,
  imageType: ImageType.SVG,
  content: UTF8String,
  width: Int,
  height: Int
]

enum ImageType {
  PNG = 0,
  JPG = 1,
  WEBP = 2,
  SVG = 3
}
```
