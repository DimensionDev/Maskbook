// This guard ensures codegen running while other command running.
import { codegen, codegenWatch } from '.'
import { getArgv, shell, task } from '../utils'
import { series, parallel, TaskFunction, TaskFunctionCallback } from 'gulp'
import { extension, extensionWatch } from '../extension'

function run(webpack: TaskFunction, cb: TaskFunctionCallback) {
    const args = getArgv()
    const cmd = String(args.c)
    if (args.w) return webpack(cb)
    const cwd = process.cwd()
    return shell.cwd(cwd)`${cmd}`
}

export const codegenGuardWatch = series(codegen, parallel(codegenWatch, run.bind(null, extensionWatch)))
export const codegenGuard = series(codegen, run.bind(null, extension))

task(codegenGuard, 'build', 'Run the following command after codegen completes', {
    '-c=[command]': 'e.g. npx gulp build-with -S -c="echo hi"',
    '-w': 'Start webpack daemon',
})
task(codegenGuardWatch, 'dev', 'Run the following command with a codegen daemon', {
    '-c=[command]': 'e.g. npx gulp dev-with -S -c="echo hi"',
    '-w': 'Start webpack daemon',
})
