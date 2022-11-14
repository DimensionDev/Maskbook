export {
    codegen,
    codegenWatch,
    i18nCodegen,
    i18nCodegenWatch,
    iconCodegen,
    iconCodegenWatch,
    typescript,
    typescriptWatch,
    resourceCopy,
    resourceCopyWatch,
} from './codegen/index.js'
export { ciBuild, extensionWatch } from './extension/index.js'
export { buildNetlify } from './netlify/index.js'

// Tools
export { clean, help, createPackageInteractive, fixLockfile, syncDevelop, changesetRelease } from './commands/index.js'
export { syncLanguages } from './locale-kit-next/index.js'
export { reorderSpellcheck } from './spellcheck/index.js'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts.js'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk.js'
export { buildPolyfill } from './projects/polyfill.js'
export { buildGun } from './projects/gun.js'
export { buildSandboxedPlugin, watchSandboxedPlugin } from './projects/sandboxed-plugins.js'
