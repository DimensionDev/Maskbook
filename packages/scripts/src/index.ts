export {
    codegen,
    codegenWatch,
    i18nCodegen,
    i18nCodegenWatch,
    iconCodegen,
    iconCodegenWatch,
    typescript,
    typescriptWatch,
} from './codegen/index.js'
export { ciBuild, buildChrome, extensionWatch } from './extension/index.js'
export { buildCloudflare } from './cloudflare/index.js'

// Tools
export { clean, createPackageInteractive, syncDevelop, changesetRelease } from './commands/index.js'
export { syncLanguages } from './locale-kit-next/index.js'
export { runLinguiExtract, runLinguiCompile } from './locale-kit-next/run-lingui.js'
export { migrate } from './locale-kit-next/migrate.js'
export { reorderSpellcheck } from './spellcheck/index.js'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts.js'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk.js'
export { buildPolyfill } from './projects/polyfill.js'
export { buildGun } from './projects/gun.js'
export { buildSandboxedPlugin, watchSandboxedPlugin } from './projects/sandboxed-plugins.js'
export { buildConstants } from './projects/build-constants.js'
export { buildContracts } from './projects/build-contracts.js'

// Linter
export { fixPluginsTSConfig } from './linter/plugin-projects.js'
export { lintPackageJson } from './linter/package-json.js'
export { lintIndex } from './linter/index-lint.js'
export { lintPo, cleanPo } from './linter/po-files.js'
