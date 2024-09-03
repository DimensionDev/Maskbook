# Polyfill

## Exports

- Basic: `dist/ecmascript.js` should be imported everywhere.
- DOM: `dist/dom.js` should be used in normal Web page.
- Worker: `dist/worker.js` should be used in Web Workers.

## Supporting browsers

- Chrome 115 (about 1 year)
- Firefox latest (not releasing)
- Safari latest (not releasing)

## Targeting ES Syntax and APIs

- Syntax: ES2023
- Library: ESNext (with [core-js](https://github.com/zloirock/core-js)).

## Web APIs and Intl APIs

Check and polyfill before using.
