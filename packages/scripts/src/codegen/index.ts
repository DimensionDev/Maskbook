import { getProcessLock, watchTask } from '../utils'
import { series, parallel, TaskFunctionCallback } from 'gulp'
import { i18nCodegen, i18nCodegenWatch } from './i18n-codegen'
import { typescript, typescriptWatch } from './typescript'
import { isLocked } from '../utils'

export function codegen(cb: TaskFunctionCallback) {
    if (isLocked('codegen')) return cb()
    const codegen = series(i18nCodegen, typescript)
    codegen(cb)
}
export const codegenWatch = series(getProcessLock.bind(null, 'codegen'), parallel(i18nCodegenWatch, typescriptWatch))
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './i18n-codegen'
export * from './typescript'
