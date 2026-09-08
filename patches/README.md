# Upstream issue/PRs

## SES compatibility

- reflect-metadata: try to overwrite `Reflect` methods. We use `ReflectMetadata` global object for them.
  - bloom-filters
- viem (2.56.x): token/tempo actions assign an own `call` property onto exported functions
  (`approve.call = call`). Under SES lockdown `Function.prototype.call` is non-writable, so the
  assignment throws at module init. The patch replaces those assignments with
  `Object.defineProperty(fn, 'call', ...)`, which defines an own property without walking the
  prototype chain. Regenerate on viem upgrades with:
  `perl -pi -e "s/^(\s*)([A-Za-z_\$][A-Za-z0-9_\$]*)\.call = call;\$/\$1Object.defineProperty(\$2, 'call', { value: call, writable: true, configurable: true });/" $(grep -rl "\.call = call;" _esm/)`

## ESM-CJS compatibility

- gulp: cannot be used with swc-node.
- @types/react-avatar-editor: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63075>
- @types/react-highlight-words: <https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63096>
- urlcat: <https://github.com/balazsbotond/urlcat/issues/248>
- ts-results-es: ts type resolution looks wrong under `moduleResolution: bundler`

## Other problems

- react-spline: <https://github.com/splinetool/react-spline/issues/133>
- react-devtools-inline: <https://github.com/facebook/react/pull/27733> and <https://github.com/facebook/react/pull/29199>
- react-use: <https://github.com/streamich/react-use/issues/1923>
- typeson-registry: <https://github.com/dfahlander/typeson-registry/issues/37>
- @scamsniffer/detector: <https://github.com/scamsniffer/scamsniffer/pull/3>
- @lingui/cli: <https://github.com/lingui/js-lingui/issues/2308> and <https://github.com/lingui/js-lingui/pull/2309>
- [notistack](https://github.com/iamhosseindhv/notistack/pull/628) not compatible with ShadowRoot
