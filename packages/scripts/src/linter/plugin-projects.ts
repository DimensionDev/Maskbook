import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { task } from '../utils/task.js'
import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { exists } from 'fs-extra'
import { prettier } from '../utils/prettier.js'

export async function fixPluginsTSConfig() {
    const folder = new URL('../../../plugins', import.meta.url)
    const file = new URL('../../../plugins/tsconfig.json', import.meta.url)
    const {
        default: { readConfigFile, formatDiagnostic },
    } = await import('typescript')

    const { config, error } = readConfigFile(fileURLToPath(file), (path) => readFileSync(path, 'utf-8'))
    if (error) {
        console.error(
            formatDiagnostic(error, {
                getCanonicalFileName: (x) => x,
                getCurrentDirectory: () => '',
                getNewLine: () => '\n',
            }),
        )
        throw new Error(`failed to read tsconfig ${file}`)
    }

    const plugins = (
        await Promise.all(
            (await readdir(folder, { withFileTypes: true }))
                .filter((x) => x.isDirectory())
                // Note: if there was a plugin but removed, git won't remove the empty directory, so we check if it has a package.json in it.
                .map(async (folder) => {
                    const pkg = join(folder.path, folder.name, 'package.json')
                    const has = await exists(pkg)
                    return has ? folder : null!
                }),
        )
    )
        .filter(Boolean)
        .map((x) => x.name)
        .sort()
    config.references = plugins.map((name) => ({ path: `./${name}/` }))
    return writeFile(fileURLToPath(file), await prettier(JSON.stringify(config), 'json', 2), 'utf-8')
}

task(fixPluginsTSConfig, 'fix-plugins-tsconfig', 'Fix plugins/tsconfig.json')
