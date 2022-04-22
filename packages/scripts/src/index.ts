export {
    codegen,
    codegenWatch,
    i18nCodegen,
    i18nCodegenWatch,
    typescript,
    typescriptWatch,
    resourceCopy,
    resourceCopyWatch,
} from './codegen'
export { ciBuild, extensionWatch } from './extension'
export { buildNetlify } from './netlify'

// Tools
export { clean, help, createPackageInteractive, fixLockfile } from './commands'
export { localeKit } from './locale-kit'
export { syncLanguages } from './locale-kit-next'
export { reorderSpellcheck } from './spellcheck'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk'
export { buildPolyfill } from './projects/polyfill'
export { buildGun } from './projects/gun'
