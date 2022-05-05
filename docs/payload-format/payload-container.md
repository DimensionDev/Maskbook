# `PayloadContainer`

> Status: This format has not been shipped to production yet. It might change at any time.

## Abstract

This is a simple binary format that describes a binary message and its signature (optionally).

It is used in the encryption of Mask Network.

## Format

The 0th byte is a switch. The interpretation of the rest part depends on the 0th byte.

### 0th byte is `0x00`

If the payload length is less than 33 bytes, it is invalid.

- Byte 1 to 32 is the `SHA-256` hash of the `message`.
- Byte 33 to the end is the `message`.

### 0th byte is `0x01`

- Byte 1 to the end is the `message`.

### 0th-byte other value

It's an invalid payload.

## Next step

Once you parsed the `message` out as a binary, you should further try to parse the `message` as a [Payload37](./payload-v37.md) object.
