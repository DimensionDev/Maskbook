import { getProcessLock, markTaskNeedCleanup, watchTask } from '../utils/index.js'
import { series, parallel, type TaskFunction } from 'gulp'
import { i18nCodegen, i18nCodegenWatch } from './i18n-codegen.js'
import { typescriptWatch } from './typescript.js'
import { iconCodegen, iconCodegenWatch } from './icon-codegen.js'

// typescript is explicitly eliminated from this task.
// our build process does not rely on tsc to give output, we have an extra check for tsc.
export const codegen: TaskFunction = series(i18nCodegen, iconCodegen)
export const codegenWatch: TaskFunction = markTaskNeedCleanup(
    series(getProcessLock.bind(null, 'codegen'), parallel(i18nCodegenWatch, typescriptWatch, iconCodegenWatch)),
)
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './i18n-codegen.js'
export * from './icon-codegen.js'
export * from './typescript.js'
