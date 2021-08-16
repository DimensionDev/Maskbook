import { ROOT_PATH, task } from '../utils'
import { readdir, writeFile } from 'fs/promises'
import { resolve, dirname, join } from 'path'
import { upperFirst } from 'lodash'
import { prettier } from '../utils/prettier'

export async function syncLanguages() {
    const config = require('../../../../.i18n-codegen.json').list
    for (const { input, generator } of config) {
        const { namespace } = generator

        const inputDir = resolve(ROOT_PATH, dirname(input))

        const languages = await getLanguages(inputDir)

        let code = '// This file is auto generated. DO NOT EDIT\n'
        code += '// Run `npx gulp sync-languages` to regenerate.\n'
        for (const language of languages) {
            code += `import ${language.replace('-', '_')} from './${language}.json'\n`
        }
        code += `\nexport * from './i18n_generated'\n`
        code += `export const languages = {\n`
        for (const language of languages) {
            code += `    '${language}': ${language.replace('-', '_')},\n`
        }
        code += `}\n`
        // Non-plugin i18n files
        if (!namespace.includes('.')) {
            let target = `@masknet/shared`
            if (namespace === 'shared') {
                target += '-base'
            }
            code += `import { createI18NBundle } from '${target}'\n`
            code += `export const add${upperFirst(namespace)}I18N = createI18NBundle('${namespace}', languages)\n`
        }
        code = await prettier(code)

        await writeFile(join(inputDir, 'index.ts'), code, { encoding: 'utf8' })
    }
}
task(
    syncLanguages,
    'sync-languages',
    "Run this when adding a new language support or adding a new package with it's own i18n files.",
)
async function getLanguages(inputDir: string): Promise<string[]> {
    const languages = (await readdir(inputDir))
        .filter((x) => x.endsWith('.json'))
        .sort()
        .map((x) => x.slice(0, -5))
    return languages
}
