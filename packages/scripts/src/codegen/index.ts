import { getProcessLock, watchTask } from '../utils'
import { series, parallel, TaskFunctionCallback } from 'gulp'
import { i18nCodegen, i18nCodegenWatch } from './i18n-codegen'
import { typescript, typescriptWatch } from './typescript'
import { isLocked } from '../utils'
import { resourceCopy, resourceCopyWatch } from './resource-files'
import { iconCodegen, iconCodegenWatch } from './icon-codegen'

export function codegen(cb: TaskFunctionCallback) {
    if (isLocked('codegen')) return cb()
    const codegen = series(i18nCodegen, typescript, resourceCopy, iconCodegen)
    codegen(cb)
}
export const codegenWatch = series(
    getProcessLock.bind(null, 'codegen'),
    parallel(resourceCopyWatch, i18nCodegenWatch, typescriptWatch, iconCodegenWatch),
)
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './i18n-codegen'
export * from './icon-codegen'
export * from './typescript'
export * from './resource-files'
