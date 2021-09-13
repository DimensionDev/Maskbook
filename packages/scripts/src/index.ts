export { clean, help } from './commands'
export { localeKit } from './locale-kit'
export { codegen, codegenWatch, i18nCodegen, i18nCodegenWatch, typescript, typescriptWatch } from './codegen'
export { ciBuild } from './extension'
export { buildNetlify } from './netlify'
export { syncLanguages } from './locale-kit-next'

// Sub-projects build commands
export { buildInjectedScript, watchInjectedScript } from './projects/injected-scripts'
export { buildMaskSDK, watchMaskSDK } from './projects/mask-sdk'
