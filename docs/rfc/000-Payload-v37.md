# Payload v-37

## Motivation

The current payload v-38 is not prepared for TypedMessage and binary data. Thus we need to find a space-optimal solution..

## Design target

- Must be a binary format.
- Must be compatible with both future and past. (Old client can parse the extended v-37 payload though may not be able to use it. New client can parse the old payload).

## Design

`PayloadAlpha37` is a extendable tuple type. To omit the field name, the compressed output can have a smaller size.

Future extensions must be appended to the end of the tuple, and the client must ignore the unknown items in the tuple.

Here is the definition of `PayloadAlpha37`. (Note, the syntax is named tuple in TypeScript and it won't appears in the real data.)

```typescript
type PayloadAlpha37 = [
  version: -37,
  // If it is in the SocialNetworkEnum
  // we can save more space
  authorNetwork: UTF8String | SocialNetworkEnum,
  authorID: UTF8String,
  //authorPublicKey: ArrayBuffer,
  // array of base58 strings of newly generated ephemeral public keys
  // indexed by SupportedCurves
  authorEphemeralPublicKeyList: [String],       // length = Object.keys(SupportedCurves).length 
  // authorPublicKeyCurve no longer necessary
  encryption: Encryption,
  iv: ArrayBuffer,
  // This should be the binary payload of TypedMessage.
  message: ArrayBuffer,
]
// false means public shared to everyone.
type Encryption =
  | false
  | [
      OwnerAESKeyEncrypted: ArrayBuffer,
      // false means not using e... encryption
      // e...PublicKey: false | [publicKey: ArrayBuffer, curve: ???]
    ]
enum SocialNetworkEnum {
  Facebook = 0,
  Twitter = 1,
}
enum SupportedCurves {
    SECP256K1 = 0, 
    SECP256R1 = 1, 
    ED25519 = 2,
}
```

Use [msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md) to compress the `PayloadAlpha37` into a binary format.
