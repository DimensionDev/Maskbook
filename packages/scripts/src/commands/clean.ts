import { awaitChildProcess, printShell, ROOT_PATH, shell, task } from '../utils/index.js'
import { join } from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

export async function clean() {
    const rimraf = await import('rimraf')
    const rm = promisify(rimraf.default)
    await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf -e node_modules ./packages/`)
    printShell`rm -rf **/node_modules/.cache`
    await rm(join(fileURLToPath(ROOT_PATH), '**/node_modules/.cache'))
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --frozen-lockfile --prefer-offline`)
}

task(clean, 'clean', 'Clean all build caches')
