# Payload version -37

Playground: copy [the playground file](./000-TypedMessage-and-Payload-37-playground.js) into a https: web page.

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

This is the top-most data type.

```typescript
type SignatureContainer = [version: Integer, payload: Binary, signature: Binary]
```

#### `version` field

This field represents the signature container version.

The first and the current version is `0`.
The implementation MUST fail when the version is not `0`.

#### `payload` field

This field represents the `Payload37` type encoded by the MessagePack.

The implementation MUST fail when the payload is not a `Payload37` after decoding.

#### `signature` field

This field represents the EC signature of the payload. The implementation MUST use SHA-256 algorithm.

### `Payload37`

```typescript
type PayloadAlpha37 = [
  version: Integer,
  authorNetwork: String | SocialNetworkEnum,
  authorID: String,
  authorPublicKeyAlgorithm: String | PublicKeyAlgorithmEnum,
  authorPublicKey: Binary,
  encryption: Encryption,
  data: Binary,
]
enum SocialNetworkEnum {
  Facebook = 0,
  Twitter = 1,
  Instgram = 2,
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

The first and the current binary version is `-37`.
The implementation MUST fail when the version is less than `-37` (e.g. `-38`).

#### `authorNetwork` field

This field represents the social network that the author of this payload belongs to.

When it is `SocialNetworkEnum`, it represents a SocialNetwork that is supported by the Mask Network.

When it is `String`, it represents a SocialNetwork cannot be expressed within the enum. e.g. A decentralized SNS like Mastodon.

#### `authorID` field

This field represents the identifiable ID of the author of this payload belongs to. In the case of an anonymous post, this field should be an empty string.

#### `authorPublicKeyAlgorithm` field

This field represents the algorithm that the public key is using.

When it is `PublicKeyAlgorithmEnum`, it represents a well-known asymmetric algorithm.

When it is `String`, it represents a asymmetric algorithm that not covered in this specification.

The implementation MUST NOT fail if the algorithm is not supported.

#### `authorPublicKey` field

This field represents the public key of the author.

The value is in the DER encoding of the SubjectPublicKeyInfo (`spki`) structure from [RFC 5280][rfc5280].

[rfc5280]: https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.7

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

This field represents the AES key of this payload.

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

This field is a Map of the DER encoding of the SubjectPublicKeyInfo (`spki`) structure from [RFC5280].

The key indicates its format.

The implementation MUST NOT fail when an unknown key appears.
The implementation MUST ignore the invalid key for the given public key format.

This field is used to support ephemeral encryption with different curves.

#### `data` field

This field represents the encrypted result of a [TypedMessage binary format](./000-TypedMessage-binary-format.md).

The implementation MUST fail when the decryption result is NOT a valid TypedMessage.

### `secp256k1`

When `spki` is mentioned in this spec, the implementation MUST be able to recognize the SubjectPublicKeyInfo of the curve [`secp256k1`][secp256k1]. This curve is widely used in the Mask Network.

[secp256k1]: https://en.bitcoin.it/wiki/Secp256k1

Here is an example of the `secp256k1` public key in Binary.

```plaintext
[
   48,  86,  48,  16,   6,   7,  42, 134,  72, 206,  61,   2,
    1,   6,   5,  43, 129,   4,   0,  10,   3,  66,   0,   4,
  236,  81,   1, 232, 133,  60, 235, 215, 107, 253, 124,  90,
   12,  21,  14, 139, 178, 143, 232,  52, 240, 119, 105,  91,
  196, 232,  84,  33, 238,  69,  42, 104, 223, 226,  96, 216,
  191, 166,  10,  63, 179, 111, 125,  99, 161, 131, 168, 172,
  181, 245, 168, 182, 150,  19, 182, 240, 202,  62, 202, 219,
   21, 175, 144, 205
]
```

### `AES_KEY`

```typescript
type AES_KEY = [alg: String, k: String]
```

This type is used in this specification to represent section 6.4 of a [JsonWebKey][rfc7518] of [AES family key][rfc7518-aes-family-key].

[rfc7518]: https://datatracker.ietf.org/doc/html/rfc7518
[rfc7518-aes-family-key]: https://datatracker.ietf.org/doc/html/rfc7518#section-6.4

The implementation MUST fail when the `alg` is not recognized as a known algorithm.
The implementation MUST fail when the `k` is not valid for the given `alg`.

When encrypting with AES key, the implementation MUST NOT use `additionalData`, the `tagLength` MUST be 128.

#### Encoding from JsonWebKey `jwk`

```js
function fromJsonWebKey(jwk) {
  return [jwk.alg, jwk.k]
}
```

#### Decoding from `key`

```js
function toJsonWebKey(key) {
  const k = { ext: true, key_ops: ['encrypt', 'decrypt'], kty: 'oct' }
  k.alg = key[0]
  k.k = key[1]
  return k
}
```

## FAQ

### Why the version number is negative?

The pre 1.0 version of the Mask Network extension uses `-42` as its initial payload version. The number `42` comes from the book _The Hitchhiker's Guide to the Galaxy_ and the minus sign indicates this is an early version. When a new payload format is drafted, it's a natural idea that the version number should add by 1, therefore it should be `-41`. At the time of this RFC written, the latest payload is version `-38`, therefore this RFC follows the convention to mark the version as `-37`.

### Why not uses the `raw` format defined in the Web Crypto specification for AES key?

According to [the Web Crypto specification][webcrypto], `raw` format is NOT standardized therefore it might have a co-operational problem.

[webcrypto]: https://w3c.github.io/webcrypto/#dfn-CryptoKey-slot-handle
