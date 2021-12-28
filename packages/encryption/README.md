# @masknet/encryption

This package provides the ability to encrypt/decrypt Mask Network payload.

This package is designed with OCap and prepared to run under SES.

## Decryption process

```
raw message (text or image)
|> Social Network decoding (socialNetworkID)
|> Standard Decryption
```

## OCap requirements

- Access to WebCrypto API

### Payload parser

- [x] v40 parser
- [x] v39 parser
- [x] v38 parser
- [x] v37 parser

### Payload encoder

- [x] v38 encoder
- [x] v37 encoder

### Encryption & Decryption

- [ ] Encryption
- [x] Decryption

### Other

- [ ] Ephemeral encryption
- [ ] P-256 support
- [ ] ed25519 support
