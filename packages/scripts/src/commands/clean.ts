import { awaitChildProcess, printShell, ROOT_PATH, shell, task } from '../utils/index.js'

export async function clean() {
    const { rimraf: rm } = await import('rimraf')
    await awaitChildProcess(
        shell.cwd(
            ROOT_PATH,
        )`git clean -xdf -e node_modules -e plugins-local.json -e i18n_generated.* -e icon-generated-as-* ./packages/`,
    )
    printShell`rm -rf **/node_modules/.cache`
    await rm('**/node_modules/.cache', {
        glob: { cwd: ROOT_PATH },
    })
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --frozen-lockfile --prefer-offline`)
}

task(clean, 'clean', 'Clean all build caches')
