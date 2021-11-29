# TypedMessage binary format

## Design target

- MUST be a binary format.
- MUST be compatible with both forward compatible and backward compatible.

## Design

### Encoding

To avoid reinvention of a new binary format, this RFC chooses to convert data into a format that can be represented in the MessagePack binary format.

Type `Integer`, `Float`, `Nil`, `Boolean`, `String`, `Binary`, `Array` and `Map` is defined in the [msgpack specification][msgpack-spec]. Other type defined in this RFC is written in the TypeScript syntax.

[msgpack-spec]: https://github.com/msgpack/msgpack/blob/master/spec.md

To avoid encoding field names into the binary (this is space-wasting), this RFC chooses to use tuple (`Array` in MessagePack), in which the order of the fields represented its meaning.

In extra, we define the following helper types:

```typescript
type Number = Integer | Float
type Any = Integer | Nil | Boolean | Float | String | Binary | Array<Any> | Map
```

In this specification, any form of MessagePack extension (like a timestamp) is NOT used. An implementation MAY treat data including extensions as invalid.

`Array` in this specification is used as `Tuple` with an arbitrary size, which means items in the Array don't have to be the same type.

e.g. `[1, "string"]` is a valid Array that has the type `Array<String | Integer>`.
If the order is meaningful, the type should be `[Integer, String]`.

All Tuple in this specification MUST be treated as non-fixed length. This means `[1, "string", true]` is valid when `[Integer, String]` is required. An implementation MUST NOT fail due to the extra item unless especially specified.

### `Document` type

This is the top-most data type.

```typescript
type Document = [version: Integer, message: TypedMessageBase]
```

#### `version` field

This field represents the format version.

When encoding, the implementation MUST use `0` as the value of this field.

When decoding, the implementation MUST fail when this field is not `0`.

Version less than 0 is invalid.

### TypedMessageBase

All TypedMessage must starts with the following fields:

```typescript
type TypedMessageBase = [
  type: TypedMessageTypeEnum | String,
  version: Integer,
  metadata: Map | Nil,
  ...rest: Array<Any>
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

### Text

```typescript
type TypedMessageText = [type: TypedMessageTypeEnum.Text, metadata: Map | Nil, content: String, textFormat?: TextFormat]
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

`Markdown` means it is a Markdown. The Markdown flavor is not specified so the rendering effect might be different depends on the library.

When decoding, lack of content field should be treated as `TextFormat.PlainText`

#### Example

This is an example of a `Document` that contains a text message `"Hello, world"` in Markdown format with metadata `{"com.example.test": "hi"}`.

- Object format: `[0, [1, { "com.example.test": "hi" }, "Hello, world", 1]]`
- Binary data:

```plaintext
[
  146,   0, 148,   1, 129, 176,  99, 111,
  109,  46, 101, 120,  97, 109, 112, 108,
  101,  46, 116, 101, 115, 116, 162, 104,
  105, 172,  72, 101, 108, 108, 111,  44,
   32, 119, 111, 114, 108, 100,   1
]
```

### TypedMessageTuple

```typescript
interface TypedMessageArray extends Array<TypedMessageBase> {}
type TypedMessageTuple = [
  type: TypedMessageTypeEnum.Tuple
  metadata: Map | Nil,
  items: TypedMessageArray,
]
```

#### `items` field

This field represents an ordered list of a TypedMessage.

#### Example

This is an example of a `Document` that contains two text messages `"Hello, world"` with no metadata.

- Object format: `[0, [0, null, [ [1, null, "Hello, world"], [1, null, "Hello, world"] ]] ]`
- Binary data:

```plaintext
[
  146,   0, 147,   0, 192, 146, 147,  1,
  192, 172,  72, 101, 108, 108, 111, 44,
   32, 119, 111, 114, 108, 100, 147,  1,
  192, 172,  72, 101, 108, 108, 111, 44,
   32, 119, 111, 114, 108, 100
]
```
