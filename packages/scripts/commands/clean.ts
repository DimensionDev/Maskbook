import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { printShell, shell } from '../utils/run.ts'
import { ROOT_PATH } from '../utils/paths.ts'
import { rimraf as rm } from 'rimraf'

await clean()
async function clean() {
    await awaitChildProcess(
        shell.cwd(
            ROOT_PATH,
        )`git clean -xdf -e node_modules -e plugins-local.json -e i18n_generated.* -e icon-generated-as-* ./packages/`,
    )
    printShell`rm -rf **/node_modules/.cache`
    await rm('**/node_modules/.cache', {
        glob: { cwd: ROOT_PATH },
    })

    printShell`rm -rf **/.turbo`
    await rm('**/.turbo', {
        glob: { cwd: ROOT_PATH },
    })

    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --prefer-offline`)
}
