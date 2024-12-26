import { readFile } from 'fs/promises'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { PKG_PATH, ROOT_PATH } from '../utils/paths.ts'
import { shell } from '../utils/run.ts'
import { fileURLToPath } from 'node:url'

// TODO: use turbo
const packages = [
    new URL('./base/', PKG_PATH),
    new URL('./encryption/', PKG_PATH),
    new URL('./typed-message/base/', PKG_PATH),
    new URL('./typed-message/react/', PKG_PATH),
    new URL('./config/', PKG_PATH),
]
await changesetRelease()
async function changesetRelease() {
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
