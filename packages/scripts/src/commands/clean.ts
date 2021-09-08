import { awaitChildProcess, getArgv, ROOT_PATH, shell, task } from '../utils'
import rimraf from 'rimraf'
import { join } from 'path'
import { promisify } from 'util'
const rm = promisify(rimraf)

export async function clean() {
    const { deps } = getArgv<{ deps: boolean }>()
    if (deps) {
        console.log('    $ rm -rf **/node_modules')
        await rm(join(ROOT_PATH, '**/node_modules'))
        console.log('    $ git clean -xdf ./packages/')
        await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf ./packages/`)
    } else {
        console.log('    $ git clean -xdf -e node_modules ./packages/')
        await awaitChildProcess(shell.cwd(ROOT_PATH)`git clean -xdf -e node_modules ./packages/`)
        console.log('    $ rm -rf **/node_modules/.cache')
        await rm(join(ROOT_PATH, '**/node_modules/.cache'))
    }
    console.log('    $ pnpm install --frozen-lockfile --prefer-offline')
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --frozen-lockfile --prefer-offline`)
}

task(clean, 'clean', 'Clean all build caches', {
    '--deps': 'including node_modules',
})
