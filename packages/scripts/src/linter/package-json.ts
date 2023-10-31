import { task } from '../utils/task.js'
import { readFile } from 'fs/promises'
import { ROOT_PATH } from '../utils/paths.js'

const pattern = 'packages/**/package.json'
export async function lintPackageJson() {
    const { glob } = await import('glob')
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, nodir: true, ignore: ['**/node_modules/**'] })

    const sideEffects: string[] = []
    const type: string[] = []
    await Promise.all(
        filePaths.map((file) =>
            readFile(file, 'utf8')
                .then(JSON.parse)
                .then((json) => {
                    if (!('sideEffects' in json)) sideEffects.push(file)
                    if (!('type' in json)) type.push(file)
                }),
        ),
    )

    let msg = ''
    if (sideEffects.length) {
        msg += `${sideEffects.length} package.json missing sideEffects field:\n`
        for (const f of sideEffects) msg += `    ${new URL(f, ROOT_PATH)}\n`
    }
    if (type.length) {
        msg += `${type.length} package.json missing type field:\n`
        for (const f of type) msg += `    ${new URL(f, ROOT_PATH)}\n`
    }

    if (sideEffects.length || type.length) throw new Error(msg)
}

task(lintPackageJson, 'lint-package-json', 'Lint all package.json must have a sideEffects field.')
