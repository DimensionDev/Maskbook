import { awaitChildProcess, parseArgs, printShell, ROOT_PATH, shell, task } from '../utils'
import rimraf from 'rimraf'
import { join } from 'path'
import { promisify } from 'util'
const rm = promisify(rimraf)

interface Args {
    deps: boolean
}
export async function clean() {
    const { deps } = parseArgs<Args>()
    if (deps) {
        printShell`rm -rf **/node_modules`
        await rm(join(ROOT_PATH, '**/node_modules'))
        await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf ./packages/`)
    } else {
        await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf -e node_modules ./packages/`)
        printShell`rm -rf **/node_modules/.cache`
        await rm(join(ROOT_PATH, '**/node_modules/.cache'))
    }
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --frozen-lockfile --prefer-offline`)
}

task(clean, 'clean', 'Clean all build caches', {
    '--deps': 'including node_modules',
})
