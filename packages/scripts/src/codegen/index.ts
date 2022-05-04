import { getProcessLock, shell, watchTask } from '../utils'
import { series, parallel, TaskFunctionCallback } from 'gulp'
import { i18nCodegen, i18nCodegenWatch } from './i18n-codegen'
import { typescript, typescriptWatch } from './typescript'
import { isLocked } from '../utils'
import { resourceCopy, resourceCopyWatch } from './resource-files'

function patchPackage() {
    return shell`pnpx patch-package`
}
export function codegen(cb: TaskFunctionCallback) {
    if (isLocked('codegen')) return cb()
    const codegen = series(patchPackage, i18nCodegen, typescript, resourceCopy)
    codegen(cb)
}
export const codegenWatch = series(
    getProcessLock.bind(null, 'codegen'),
    parallel(patchPackage, resourceCopyWatch, i18nCodegenWatch, typescriptWatch),
)
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './i18n-codegen'
export * from './typescript'
export * from './resource-files'
