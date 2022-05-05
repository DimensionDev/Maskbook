# Payload version -37

<!-- markdownlint-disable no-duplicate-heading -->

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

### `SignatureContainer`

Binary format of `SignatureContainer`:

If the 0th byte is `0x00`, it is a `SignatureContainer` with the following format:

- 1nd byte to the end is the payload (`PayloadAlpha37` encoded by messagepack).

If the 0st byte is `0x01`, it is a `SignatureContainer` with the following format:

- 1nd byte to 32th byte is the signature (SHA-256).
- 33th byte to the end is the payload (`PayloadAlpha37` encoded by messagepack).

### `Payload37`

```typescript
type PayloadAlpha37 = [
  version: Integer,
  authorNetwork: String | SocialNetworkEnum | null,
  authorID: String | null,
  authorPublicKeyAlgorithm: String | PublicKeyAlgorithmEnum,
  authorPublicKey: Binary | null,
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

When it is `null`, it represents no this information is available (due to software defeat or user choice to opt-out).

#### `authorID` field

This field represents the identifiable ID of the author of this payload belongs to. In the case of an anonymous post, this field should be an empty string.

When it is `null`, it represents no this information is available (due to software defeat or user choice to opt-out).

#### `authorPublicKeyAlgorithm` field

This field represents the algorithm that the public key is using.

When it is `PublicKeyAlgorithmEnum`, it represents a well-known asymmetric algorithm.

When it is `String`, it represents a asymmetric algorithm that not covered in this specification.

The implementation MUST NOT fail if the algorithm is not supported.

#### `authorPublicKey` field

This field represents the public key of the author.

The value is in the compressed format of the EC key.

When it is `null`, it represents no this information is available (due to software defeat or user choice to opt-out).

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
The implementation MUST fail when the first item is not recognizable.

##### `PublicEncrypted`

This type represents this payload is encrypted, but the AES key is shared with everyone (and encoded in the payload).
Which means the message is NOT shared.

```typescript
type PublicEncrypted = [kind: EncryptionKind.Public, AES_KEY: AES_KEY, iv: Binary]
```

###### `AES_KEY`

This field represents the raw AES-256-GCM key (binary) of this payload.

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

This field represents an encrypted AES key of this payload that is encrypted with the author's local key (local key is a Mask Network concept).

###### `iv` field

This field represents the iv used to encrypt the message.

###### `authorEphemeralPublicKey` field

This field is a Map of the compressed format of the EC key.

The key indicates its format.

The implementation MUST NOT fail when an unknown key appears.
The implementation MUST ignore the invalid key for the given public key format.

This field is used to support ephemeral encryption with different curves.

#### `data` field

This field represents the encrypted result of a [TypedMessage binary format](./000-TypedMessage-binary-format.md).

The implementation MUST fail when the decryption result is NOT a valid TypedMessage.

### `secp256k1`

[secp256k1]: https://en.bitcoin.it/wiki/Secp256k1

## FAQ

### Why the version number is negative?

The pre 1.0 version of the Mask Network extension uses `-42` as its initial payload version. The number `42` comes from the book _The Hitchhiker's Guide to the Galaxy_ and the minus sign indicates this is an early version. When a new payload format is drafted, it's a natural idea that the version number should add by 1, therefore it should be `-41`. At the time of this RFC written, the latest payload is version `-38`, therefore this RFC follows the convention to mark the version as `-37`.
