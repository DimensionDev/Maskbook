# Dependencies upgrading

- `react` and `react-dom`: following `experimental` tag until concurrent mode includes in the stable release.
- `@material-ui/*`: following `next` tag until v5 stable release.
- `@dimensiondev/webextension-shim`: MUST match the version from the iOS side.
- `@dimensiondev/stego-js`: See https://github.com/DimensionDev/Maskbook/pull/2139
- `idb`: Do NOT upgrade to 6.0.0 because it [contains incompatible type helpers](https://github.com/jakearchibald/idb/pull/200) within our project.
- `jss`: MUST match the version that `@material-ui/*` relies on.
- `stream-http`: DO NOT upgrade to version 3, it is used as a polyfill in Webpack but version 3 seems breaking.
- Blockchain related: contact @guanbinrui
- Puppeteer related: contact @guanbinrui

Other dependencies
