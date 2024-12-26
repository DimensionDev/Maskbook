import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { ROOT_PATH } from '../utils/paths.ts'
import { fileURLToPath } from 'node:url'

export async function getLinguiEnabledPackages() {
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
