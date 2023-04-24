# Polyfill

## Exports

- Basic: `dist/ecmascript.js` should be imported everywhere.
- DOM: `dist/dom.js` should be used in normal Web page.
- Worker: `dist/worker.js` should be used in Web Workers.

## Supporting browsers

- Chrome Last 2 versions (about 3 months)
- Firefox Last 2 versions (about 3 months)

## Targeting ES Syntax and APIs

- Syntax: ES2022
- Library: ES2022 (with [core-js](https://github.com/zloirock/core-js)).

### Caution

Those features are not easy to polyfill.

- ES2017: SharedArrayBuffer and Atomics

## Web APIs and Intl APIs

Check and polyfill before using.

### Simply polyfilled

- Intl.ListFormat

### Using polyfill

- navigator.clipboard (with `ClipboardItem`) (Firefox not supported: <https://caniuse.com/mdn-api_clipboarditem>)
