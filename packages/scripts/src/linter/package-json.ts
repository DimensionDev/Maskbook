import { task } from '../utils/task.js'
import { readFile, writeFile } from 'fs/promises'
import { ROOT_PATH } from '../utils/paths.js'

const pattern = 'packages/**/package.json'
export async function lintPackageJson() {
    const { glob } = await import('glob')
    /* cspell:disable-next-line */
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

                    if ('lingui' in json) {
                        let template: any = {
                            compileNamespace: 'json',
                            locales: ['en-US', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'],
                            fallbackLocales: {
                                'zh-CN': 'zh-TW',
                                'zh-TW': 'zh-CN',
                                default: 'en-US',
                            },
                            formatOptions: {
                                origins: true,
                                lineNumbers: false,
                            },
                        }
                        const target = { ...json.lingui }
                        const old = target.catalogs
                        delete target.catalogs
                        if (JSON.stringify(target) !== JSON.stringify(template)) {
                            template.catalogs = old
                            json.lingui = template
                            return writeFile(file, JSON.stringify(json, null, 2))
                        }
                    }
                    return
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

task(lintPackageJson, 'lint-package-json', 'Lint all package.json.')
