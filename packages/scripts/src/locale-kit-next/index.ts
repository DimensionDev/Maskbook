import { ROOT_PATH, task } from '../utils'
import { readdir, writeFile } from 'fs/promises'
import { resolve, dirname, join } from 'path'
import { upperFirst } from 'lodash-unified'
import { prettier } from '../utils/prettier'

const mainFallbackMap = new Map([['zh', 'zh-TW']])

const header = `// This file is auto generated. DO NOT EDIT
// Run \`npx gulp sync-languages\` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
`
export async function syncLanguages() {
    const config = require('../../../../.i18n-codegen.json').list
    for (const { input, generator } of config) {
        const { namespace } = generator

        const inputDir = resolve(ROOT_PATH, dirname(input))

        const languages = await getLanguages(inputDir)

        {
            let code = header
            code += `\nexport * from './i18n_generated'\n`
            code = await prettier(code)
            await writeFile(join(inputDir, 'index.ts'), code, { encoding: 'utf8' })
        }

        {
            let code = header
            for (const [language] of languages) {
                code += `import ${language.replace('-', '_')} from './${language}.json'\n`
            }
            code += `export const languages = {\n`
            for (const [language, familyName] of languages) {
                code += `    '${familyName}': ${language.replace('-', '_')},\n`
            }
            code += `}\n`
            // Non-plugin i18n files
            if (!namespace.includes('.')) {
                const target = `@masknet/shared-base`
                code += `import { createI18NBundle } from '${target}'\n`
                code += `export const add${upperFirst(namespace)}I18N = createI18NBundle('${namespace}', languages)\n`
            }
            code = await prettier(code)
            await writeFile(join(inputDir, 'languages.ts'), code, { encoding: 'utf8' })
        }
    }
}
task(
    syncLanguages,
    'sync-languages',
    "Run this when adding a new language support or adding a new package with it's own i18n files.",
)
async function getLanguages(inputDir: string): Promise<Map<string, string>> {
    const languages = (await readdir(inputDir))
        .filter((x) => x.endsWith('.json'))
        .sort()
        .map((x) => x.slice(0, -5))
    const languageMap = new Map<string, string>()
    const hasFamily = new Set()

    for (const language of languages) {
        const family = language.slice(0, 2)
        if (hasFamily.has(family) || (mainFallbackMap.has(family) && mainFallbackMap.get(family) !== language)) {
            languageMap.set(language, language)
        } else {
            languageMap.set(language, family)
            hasFamily.add(family)
        }
    }
    return languageMap
}
