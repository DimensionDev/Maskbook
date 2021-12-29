# Dependencies upgrading

- `@dimensiondev/webextension-shim`: MUST match the version from the iOS side.
- `@dimensiondev/stego-js`: See <https://github.com/DimensionDev/Maskbook/pull/2139>
- `stream-http`: DO NOT upgrade to version 3, it is used as a polyfill in Webpack but version 3 seems breaking.
- Blockchain related: contact @guanbinrui

Other dependencies
