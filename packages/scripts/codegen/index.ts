// typescript is explicitly eliminated from this task.
// our build process does not rely on tsc to give output, we have an extra check for tsc.
// export const codegenWatch: TaskFunction = markTaskNeedCleanup(
//     series(getProcessLock.bind(null, 'codegen'), parallel(typescriptWatch, iconCodegenWatch)),
// )
// watchTask(codegen, codegenWatch, 'codegen', 'All codegen tasks combined into one')

export * from './icon-codegen.js'
