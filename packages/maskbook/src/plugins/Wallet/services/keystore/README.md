# KeyStore service

## Restore Wallet from Keystore format (Workflow)

issue: <https://github.com/DimensionDev/Maskbook/issues/2661>

1. parse json string
2. use z-schema validate data correctness
3. make derived key
4. validate `mac` field correctness
5. decrypt ciphertext

## Backup Wallet as Keystore format (Workflow)

issue: <https://github.com/DimensionDev/Maskbook/issues/2662>

Inactive rationale: No mainstream wallet implementation

## References

- <https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition>
- <https://archive.is/q1zut>
