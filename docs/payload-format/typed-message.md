# TypedMessage binary format

<!-- markdownlint-disable no-duplicate-heading -->

> Status: This format has not been shipped to production yet. It might change at any time.

## Abstract

This is a binary format that is used to represent a rich document (text, images, ...etc).

## Encoding

Following the [encoding convention of Payload37](./payload-v37.md#encoding).

### `Document` type

This is the top-most data type.

```typescript
type Document = [version: Integer, ...Any]
```

- When `version` is `0`:
  - This is a `TypedMessageText`.
  - It should be parsed in the following way:

```typescript
type Document = [version: 0, text: String, meta?: Map | Nil]
```

- When `version` is `1`:
  - The rest of the fields are `TypedMessage`.
  - It should be parsed in the following way:

```typescript
type Document = [version: 1, ...TypedMessage]

function parse(doc: Array<any>) {
  // drop the version field, and treat the rest as a TypedMessage
  if (doc[0] === 1) return parseTypedMessage(doc.slice(1))
}
```

### `TypedMessage`

All `TypedMessage` must start with the following fields:

```typescript
type TypedMessageBase = [
  type: TypedMessageTypeEnum | String,
  version: Integer,
  metadata: Map | Nil,
  ...rest: Array<Any>,
]
enum TypedMessageTypeEnum {
  Tuple = 0,
  Text = 1,
}
```

#### `type` field

This field represents the type of this TypedMessage.

It is a `TypedMessageTypeEnum` or a UTF-8 string.

When it is `TypedMessageTypeEnum`, it represents a well-known TypedMessage defined in this specification.

When it is a `String`, it represents a custom extension of TypedMessage.

An implementation MAY ignore an unknown type or render a hint.

#### `version`

This field represents the version of this TypedMessage contains.

#### `metadata`

This field represents the metadata this TypedMessage contains.

An implementation MUST NOT assume the data structure inside the metadata.

### `TypedMessageText`

```typescript
type TypedMessageText = [
  //
  type: TypedMessageTypeEnum.Text,
  metadata: Map | Nil,
  content: String,
  textFormat?: TextFormat,
]
enum TextFormat {
  PlainText = 0,
  Markdown = 1,
}
```

#### `content` field

This field represents a text message. The interpretation of content depends on the `textFormat` field.

#### `textFormat` field

This is an optional field that represents the interpretation of the `content` field.

`PlainText` means it is plain text.

`Markdown` means it is a Markdown. The Markdown flavor is not specified so the rendering effect might be different depending on the library.

When decoding, the lack of content field should be treated as `TextFormat.PlainText`

### `TypedMessageTuple`

```typescript
type TypedMessageTuple = [
  type: TypedMessageTypeEnum.Tuple
  metadata: Map | Nil,
  items: Array<TypedMessageBase>,
]
```
