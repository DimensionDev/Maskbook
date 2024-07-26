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
export { buildCloudflare } from './cloudflare/index.js'

// Tools
export { clean, help, createPackageInteractive, syncDevelop, changesetRelease } from './commands/index.js'
export { syncLanguages } from './locale-kit-next/index.js'
export { reorderSpellcheck } from './spellcheck/index.js'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts.js'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk.js'
export { buildPolyfill } from './projects/polyfill.js'
export { buildGun } from './projects/gun.js'
export { buildSandboxedPlugin, watchSandboxedPlugin } from './projects/sandboxed-plugins.js'

// Linter
export { fixPluginsTSConfig } from './linter/plugin-projects.js'
export { lintPackageJson as lintSideEffects } from './linter/package-json.js'
export { lintIndex } from './linter/index-lint.js'
