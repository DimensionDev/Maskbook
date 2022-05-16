# Payload version -37

> Status: This format has not been shipped to production yet. It might change at any time.

## Abstract

This is a binary format that is used to represent an encrypted message in the Mask Network.

The implementor SHOULD implement a tolerate parser for the payload.

## Encoding

To avoid reinvention of a new binary format that is hard to parse/generate, this specification chooses to represent data in the [MessagePack][msgpack-spec] binary format.

Type `Integer`, `Float`, `Nil`, `Boolean`, `String`, `Binary`, `Array` and `Map` are defined in the [msgpack specification][msgpack-spec]. Other type defined in this RFC is written in the TypeScript syntax.

To avoid encoding field names into the binary (which is space-wasting), this RFC chooses to use a tuple (represented by `Array` in MessagePack), in which the order of the fields represented its meaning.

In extra, we define the following helper types:

```typescript
type Number = Integer | Float
type Any = Integer | Nil | Boolean | Float | String | Binary | Array<Any> | Map
```

In this specification, any form of MessagePack extension (like a timestamp) is NOT used. An implementation MAY treat data including extensions as invalid.

`Array` in this specification is used as `Tuple` with an arbitrary size, which means items in the Array don't have to be the same type.

> e.g. both `[1, "string"]` and `["string", 1]` are valid `Array`s that has the type `Array<String | Integer>`.
> But if the order is meaningful, the type should be `[Integer, String]`.

All Tuple in this specification MUST be treated as non-fixed length. This means `[1, "string", true]` is valid when `[Integer, String]` is required. An implementation MUST NOT fail due to the extra item unless especially specified.

### `Payload37`

```typescript
type PayloadAlpha37 = [
  version: Integer,
  authorNetwork: String | SocialNetworkEnum | Nil,
  authorID: String | Nil,
  authorPublicKeyAlgorithm: String | PublicKeyAlgorithmEnum,
  authorPublicKey: Binary | Nil,
  encryption: Encryption,
  data: Binary,
]
enum SocialNetworkEnum {
  Facebook = 0,
  Twitter = 1,
  Instagram = 2,
  Minds = 3,
}
enum PublicKeyAlgorithmEnum {
  ed25519 = 0,
  secp256p1 = 1, // P-256
  secp256k1 = 2, // K-256
}
```

#### `version` field

This field represents the format version.

The first and the current binary version is `0`.

#### `authorNetwork` field

This field represents the social network that the author of this payload belongs to.

When it is `SocialNetworkEnum`, it represents a SocialNetwork that is supported by the Mask Network.

When it is `String`, it represents a SocialNetwork cannot be expressed within the enum. e.g. A decentralized SNS like Mastodon.

When it is `Nil`, it represents no information is available (due to software defeat or user choice to opt out).

#### `authorID` field

This field represents the identifiable ID of the author of this payload `Nil`.

When it is `Nil`, it represents no information is available (due to software defeat or user choice to opt out).

#### `authorPublicKeyAlgorithm` field

This field represents the algorithm that the public key is using.

When it is `PublicKeyAlgorithmEnum`, it represents a well-known asymmetric algorithm.

When it is `String`, it represents an asymmetric algorithm that is not covered in this specification.

The implementation MUST NOT fail if the algorithm is not supported.

#### `authorPublicKey` field

This field represents the public key of the author.

The value is in the compressed format of the EC key.

> TODO: clarify "compressed" format

When it is `Nil`, it represents no information is available (due to software defeat or user choice to opt out).

#### `encryption` field

This field represents how this payload is encrypted. There are two types of encryption, `PublicEncrypted` and `PeerToPeerEncrypted`

```typescript
type Encryption = PublicEncrypted | PeerToPeerEncrypted
enum EncryptionKind {
  Public = 0,
  PeerToPeer = 1,
}
```

The `Encryption` type is a tagged Tuple (the first item is the tag).

##### `PublicEncrypted`

This type represents this payload is encrypted, but the AES key is shared with everyone (and encoded in the payload).

This means the message is NOT privately encrypted.

```typescript
type PublicEncrypted = [
  //
  kind: EncryptionKind.Public,
  AES_KEY: Binary,
  iv: Binary,
]
```

###### `AES_KEY`

This field represents the raw AES-256-GCM key of this payload.

###### `iv` field

This field represents the iv used to encrypt the message.

##### `PeerToPeerEncrypted`

```typescript
type PeerToPeerEncrypted = [
  kind: EncryptionKind.PeerToPeer,
  ownerAESKeyEncrypted: Binary,
  iv: Binary,
  authorEphemeralPublicKey: Map<PublicKeyAlgorithmEnum, Binary>,
]
```

###### `ownerAESKeyEncrypted` field

This field represents an encrypted AES key of this payload that is encrypted with the author's public key via ECDH.

###### `authorEphemeralPublicKey` field

This field is a Map of the compressed format of the EC key.

> TODO: clarify "compressed" format

The key indicates its format.

The implementation MUST NOT fail when an unknown key appears.

The implementation MUST ignore the invalid key for the given public key format.

This field is used to support ephemeral encryption with different curves.

#### `data` field

This field represents the encrypted result of a [TypedMessage binary format](./typed-message.md).

## References

- secp256k1: <https://en.bitcoin.it/wiki/Secp256k1>
- [MessagePack][msgpack-spec]

[msgpack-spec]: https://github.com/msgpack/msgpack/blob/master/spec.md

## Next step

Once you parsed the `Payload37`, you should use the information in the payload to decrypt the message.

Once the message is decrypted, you should parse the message by [the TypedMessage spec](./typed-message.md).

## FAQ

### Why the version number is negative?

The pre 1.0 version of the Mask Network extension uses `-42` as its initial payload version. The number `42` comes from the book _The Hitchhiker's Guide to the Galaxy_ and the minus sign indicates this is an early version. When a new payload format is drafted, it's a natural idea that the version number should add by 1, therefore it should be `-41`. At the time of this spec written, the latest payload is version `-38`, therefore this spec follows the convention to mark the version as `-37`.
