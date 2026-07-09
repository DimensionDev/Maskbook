<!-- cspell:disable -->

# Upstream issue/PRs

## SES compatibility

- reflect-metadata: try to overwrite `Reflect` methods. We use `ReflectMetadata` global object for them.
  - bloom-filters

## ESM-CJS compatibility

- gulp: cannot be used with swc-node.
- @types/react-avatar-editor: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63075>
- @types/react-highlight-words: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63096>
- urlcat: <https://github.com/balazsbotond/urlcat/issues/248>
- ts-results-es: ts type resolution looks wrong under `moduleResolution: bundler`

## Other problems

- react-spline: <https://github.com/splinetool/react-spline/issues/133>
- eslint-plugin-i: <https://github.com/import-js/eslint-plugin-import/pull/1900/>
- react-devtools-inline: <https://github.com/facebook/react/pull/27733> and <https://github.com/facebook/react/pull/29199>
- react-use: <https://github.com/streamich/react-use/issues/1923>
- typeson-registry: <https://github.com/dfahlander/typeson-registry/issues/37>
- @scamsniffer/detector: <https://github.com/scamsniffer/scamsniffer/pull/3>
- @lingui/cli: <https://github.com/lingui/js-lingui/issues/2308> and <https://github.com/lingui/js-lingui/pull/2309>

## CVEs

- native-fetch > undici: package no longer maintained, Node.js now with built-in fetch.
