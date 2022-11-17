import { readFile } from 'fs/promises'
import { awaitChildProcess } from '../utils/awaitChildProcess.js'
import { ROOT_PATH } from '../utils/paths.js'
import { shell } from '../utils/run.js'
import { task } from '../utils/task.js'
import { fileURLToPath } from 'node:url'

const packages = [
    new URL('../../../base/', import.meta.url),
    new URL('../../../encryption/', import.meta.url),
    new URL('../../../typed-message/base/', import.meta.url),
    new URL('../../../typed-message/react/', import.meta.url),
    new URL('../../../config/', import.meta.url),
]
export async function changesetRelease() {
    const tsc = awaitChildProcess(shell.cwd(ROOT_PATH)`npx tsc -b ./tsconfig.npm.json`)
    const buildTask: Promise<any>[] = packages.map((path) =>
        readFile(new URL('./package.json', path), 'utf-8')
            .then(JSON.parse)
            .then((json) => {
                if (json.scripts?.build) return shell.cwd(ROOT_PATH)`pnpm -C ${fileURLToPath(path)} run build`
                return undefined
            }),
    )
    await Promise.all(buildTask.concat(tsc))
    await awaitChildProcess(shell.cwd(ROOT_PATH)`npx changeset publish`)
}
task(changesetRelease, 'changeset-release', 'Release script run by changeset')
