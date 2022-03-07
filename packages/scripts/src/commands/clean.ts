import { awaitChildProcess, printShell, ROOT_PATH, shell, task } from '../utils'
import rimraf from 'rimraf'
import { join } from 'path'
import { promisify } from 'util'
const rm = promisify(rimraf)

export async function clean() {
    await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf -e node_modules ./packages/`)
    printShell`rm -rf **/node_modules/.cache`
    await rm(join(ROOT_PATH, '**/node_modules/.cache'))
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --frozen-lockfile --prefer-offline`)
}

task(clean, 'clean', 'Clean all build caches')
