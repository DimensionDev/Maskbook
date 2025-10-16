import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { ROOT_PATH, task, shell, awaitChildProcess } from '../utils/index.ts'
import { fileURLToPath } from 'node:url'

async function getLinguiEnabledPackages() {
    const folders: string[] = []
    const files = (
        await Promise.all([
            readdir(new URL('./packages', ROOT_PATH), { withFileTypes: true }),
            readdir(new URL('./packages/plugins', ROOT_PATH), { withFileTypes: true }),
        ])
    ).flat()
    await Promise.allSettled(
        files.map(async (file) => {
            if (!file.isDirectory()) return
            const path = join(file.parentPath, file.name)
            const pkg = join(path, 'package.json')
            if ((await readFile(pkg, 'utf-8')).includes('"lingui"')) {
                folders.push('./' + relative(fileURLToPath(ROOT_PATH), path))
            }
        }),
    )
    return folders
}
const parallel = process.env.CI ? '' : '--parallel'
export async function runLinguiExtract() {
    const folders = await getLinguiEnabledPackages()
    return awaitChildProcess(
        shell`pnpm -r --no-reporter-hide-prefix --aggregate-output --reporter=append-only ${parallel} ${folders.map((x) => '--filter ' + x).join(' ')} exec lingui extract`,
    )
}
task(runLinguiExtract, 'lingui-extract', 'Run lingui extract on all workspace packages')

export async function runLinguiCompile() {
    const folders = await getLinguiEnabledPackages()
    await awaitChildProcess(
        shell`pnpm -r --no-reporter-hide-prefix --aggregate-output --reporter=append-only ${parallel} ${folders.map((x) => '--filter ' + x).join(' ')} exec lingui compile`,
    )
    return awaitChildProcess(
        shell`pnpm -r --no-reporter-hide-prefix --aggregate-output --reporter=append-only ${parallel} ${folders.map((x) => '--filter ' + x).join(' ')} exec prettier --write './**/*.json'`,
    )
}
task(runLinguiCompile, 'lingui-compile', 'Run lingui compile on all workspace packages')
