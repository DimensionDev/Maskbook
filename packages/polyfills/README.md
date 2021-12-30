# Polyfill

## Exports

- Basic: `dist/ecmascript.js` should be imported everywhere.
- DOM: `dist/dom.js` should be used in normal Web page.
- Worker: `dist/worker.js` should be used in Web Workers.

Extra:

- Proposals: `dist/esnext.js` provides useful ES proposals (don't forget to include type definition as well).
- Intl: `dist/intl.js` provides polyfill for ES Intl API.
- Secp256k1 support in WebCrypto: `dist/secp256k1.js`

## Supporting browsers

- Safari 13.4+ (Released on Sept 2019)
- Chrome Last 2 versions (about 3 months) (91+ at 7/23/2021)
- Firefox Last 2 versions (about 3 months) (97+ at 7/23/2021)
- GeckoView 91 (last updated at 7/23/2021).

## ES Syntax and APIs

We're targeting syntax and libraries to ES2020.

Fell free to add polyfill (or install it from npm).
For proposals, stage 2 or higher can be considered.

### Caution

- ES2017: SharedArrayBuffer and Atomics
- ES2018: - (Syntax) RegExp Lookbehind Assertions (Safari not supported)
- ES2020: BigInt (requires Safari 15)
- ES2021:
  - WeakReference (requires Safari 15)
  - (Syntax) Logical Assignment (requires Safari 14)
- ES2022:
  - ⭐ C l a s s ⭐ F i e l d s ⭐ (requires Safari 15)
  - Class initialization block (Safari not supported, Firefox 93+)

## Web APIs and Intl APIs

Check and polyfill before using.

### Simply polyfilled

- Intl.ListFormat
- EventTarget.constructor (requires Safari 14)

### Using polyfill

- navigator.clipboard (with `ClipboardItem`) (Firefox not supported)
