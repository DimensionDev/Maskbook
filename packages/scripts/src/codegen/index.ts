import { getProcessLock, watchTask } from '../utils/index.js'
import { series, parallel, TaskFunctionCallback } from 'gulp'
import { i18nCodegen, i18nCodegenWatch } from './i18n-codegen.js'
import { typescript, typescriptWatch } from './typescript.js'
import { isLocked } from '../utils/index.js'
import { resourceCopy, resourceCopyWatch } from './resource-files.js'
import { iconCodegen, iconCodegenWatch } from './icon-codegen.js'

export function codegen(cb: TaskFunctionCallback) {
    if (isLocked('codegen')) return cb()
    const codegen = series(i18nCodegen, iconCodegen, typescript, resourceCopy)
    codegen(cb)
}
export const codegenWatch = series(
    getProcessLock.bind(null, 'codegen'),
    parallel(resourceCopyWatch, i18nCodegenWatch, typescriptWatch, iconCodegenWatch),
)
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './i18n-codegen.js'
export * from './icon-codegen.js'
export * from './typescript.js'
export * from './resource-files.js'
