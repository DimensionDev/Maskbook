export { codegen, codegenWatch, iconCodegen, iconCodegenWatch, typescript, typescriptWatch } from './codegen/index.ts'
export { ciBuild, buildChrome, extensionWatch, extensionWatchRspack } from './extension/index.ts'
export { buildCloudflare } from './cloudflare/index.ts'

// Tools
export { clean, syncDevelop, changesetRelease } from './commands/index.ts'
export { reorderSpellcheck } from './spellcheck/index.ts'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts.ts'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk.ts'
export { buildPolyfill } from './projects/polyfill.ts'
export { buildGun } from './projects/gun.ts'
export { buildConstants } from './projects/build-constants.ts'
export { buildContracts } from './projects/build-contracts.ts'

// Linter
export { fixPluginsTSConfig } from './linter/plugin-projects.ts'
export { lintPackageJson } from './linter/package-json.ts'
export { lintIndex } from './linter/index-lint.ts'
export { cleanPo } from './linter/po-files.ts'
