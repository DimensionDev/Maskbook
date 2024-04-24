# Upstream issue/PRs

## SES compatibility

- reflect-metadata: try to overwrite `Reflect` methods. We use `ReflectMetadata` global object for them.
  - bloom-filters

### Bundled outdated `regenerator-runtime`

- @ceramicnetwork/rpc-transport

## ESM-CJS compatibility

- gulp: cannot be used with ts-node/esm mode.
- @types/react-avatar-editor: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63075>
- web3: <https://github.com/web3/web3.js/issues/5543>
- @project-serum/sol-wallet-adapter: <https://github.com/project-serum/sol-wallet-adapter/issues/53>
- @types/react-highlight-words: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63096>
- urlcat: <https://github.com/balazsbotond/urlcat/issues/248>

- rss3-next: The repo has been archived. See <https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript#readme>
- @cyberlab/cyberconnect: The repo is 404
- fortmatic: The repo is 404
- guess-calling-code: TODO: open an issue at <https://github.com/AstraSurge/guess-calling-code>

## Other problems

- web3: <https://github.com/web3/web3.js/pull/5274> crashes
- @chainsafe/as-sha256: currently we cannot load WebAssembly modules in the content script. compiled into JS by <https://github.com/WebAssembly/binaryen/tree/main>.
- @mui/base: <https://github.com/mui/material-ui/issues/25077>
- react-spline: <https://github.com/splinetool/react-spline/issues/133>
- eslint-plugin-i: <https://github.com/import-js/eslint-plugin-import/pull/1900/>
- react-devtools-inline: <https://github.com/facebook/react/pull/27733>
- @lifi/widget@2.10.1: Customized requirements, details can be viewed at the fork repository <https://github.com/DimensionDev/lifi-widget>
- micromark-util-symbol: TODO: why?
- micromark: TODO: why?
- react-use: <https://github.com/streamich/react-use/issues/1923>

## CSP

- @protobufjs/inquire: We don't allow eval.
