import { getProcessLock, markTaskNeedCleanup, watchTask } from '../utils/index.ts'
import { series, parallel, type TaskFunction } from 'gulp'
import { typescriptWatch } from './typescript.ts'
import { iconCodegen, iconCodegenWatch } from './icon-codegen.ts'

// typescript is explicitly eliminated from this task.
// our build process does not rely on tsgo to give output, we have an extra check for tsgo.
export const codegen: TaskFunction = series(iconCodegen)
export const codegenWatch: TaskFunction = markTaskNeedCleanup(
    series(getProcessLock.bind(null, 'codegen'), parallel(typescriptWatch, iconCodegenWatch)),
)
watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './icon-codegen.ts'
export * from './typescript.ts'
