# Configuration

This package is an client of [Mask Configuration](https://github.com/DimensionDev/Mask-Configuration). It fetches configuration from a remote server. In brief, it returns the stale data while emitting an updating request to keep data fresh finally.

## Usage

```ts
const WHITELIST = create('whitelist', [
  '0x0000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000002',
  '0x0000000000000000000000000000000000000003',
])

// at first, it returns the initial whitelist
// at the same time, it emits a revalidate request
const whitelist = WHITELIST.get()

// a few moments later, the server returns the fresh data
const whitelistSynced = WHITELIST.get()
```
