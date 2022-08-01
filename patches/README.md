# Upstream issue/PRs

## SES compatibility

- cross-fetch: try to modify `fetch`. <https://github.com/lquixada/cross-fetch/pull/137>
- immer: try to overwrite `Map` and `Set` methods. <https://github.com/immerjs/immer/pull/914/>

### Bundled outdated `regenerator-runtime`

- @ceramicnetwork/rpc-transport
- @uniswap/v3-sdk <https://github.com/Uniswap/v3-sdk/issues/109>

## Worker compatibility

- arweave: try to access `window` in Worker. <https://github.com/ArweaveTeam/arweave/issues/379>
- @snapshot-labs/snapshot.js: bundled outdated `__awaitor` and try to access `window`. <https://github.com/snapshot-labs/snapshot.js/issues/668>
- cross-blob: try to access `document` (by `blob-polyfill` but `blob-polyfill` does not have an issue forum).
- web3-providers-http: try to use `XMLHttpRequest`. <https://github.com/ChainSafe/web3.js/issues/5281>

## ESM-CJS compatibility

- ts-results: provide invalid pure-esm support. <https://github.com/vultix/ts-results/issues/37>
- gulp: cannot be used with ts-node/esm mode.

## Other problems

- emotion-js: SSR rendering does not work on browser. <https://github.com/emotion-js/emotion/issues/2691>
