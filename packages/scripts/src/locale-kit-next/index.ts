import { readdir, writeFile, readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { upperFirst } from 'lodash-es'
import { ROOT_PATH, task, prettier } from '../utils/index.js'
import { exists } from 'fs-extra'
import { relative } from 'path/posix'
import { fileURLToPath } from 'url'

const mainFallbackMap = new Map([['zh', 'zh-TW']])

const basicHeader = `// This file is auto generated. DO NOT EDIT
// Run \`npx gulp sync-languages\` to regenerate.`
const header = `${basicHeader}
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
`

export async function syncLanguages() {
    const { glob } = await import('glob')
    const poFiles = await glob('**/en-US.po', { cwd: ROOT_PATH })
    for (const poFile of poFiles) {
        const inputDir = new URL(dirname(poFile) + '/', ROOT_PATH)
        const languages = getLanguageFamilyName(
            (await readdir(inputDir, { withFileTypes: true })).filter((x) => x.isFile()).map((x) => x.name),
        )

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
            if (!poFile.includes('plugin')) {
                const target = `@masknet/shared-base`
                code += `import { createI18NBundle } from '${target}'\n`
                code += `export const addI18N = createI18NBundle('_', [undefined, languages as any])\n`
            }

            {
                const allImportPath: string[] = []
                const binding: string[] = []
                for (const [language, familyName] of languages) {
                    allImportPath.push(`./${language}.json`)
                    binding.push(`'${familyName}': ${language.replace('-', '_')}`)
                }
                code += `// @ts-ignore
                        import.meta.webpackHot.accept(
                            ${JSON.stringify(allImportPath)},
                            () => globalThis.dispatchEvent?.(new CustomEvent('MASK_I18N_HMR_LINGUI', {
                                detail: { ${binding.join(', ')} }
                            }))
                        )`
            }
            code = await prettier(code)
            await writeFile(new URL('languages.ts', inputDir), code, { encoding: 'utf8' })
        }
    }
    const config = JSON.parse(await readFile(new URL('.i18n-codegen.json', ROOT_PATH), 'utf-8')).list
    for (const { input, generator } of config) {
        const { namespace } = generator

        const inputDir = new URL(dirname(input) + '/', ROOT_PATH)
        const linguiDir =
            input.includes('packages/mask') ?
                new URL('../../../mask/shared-ui/locale/', import.meta.url)
            :   new URL(join(dirname(input), '../locale') + '/', ROOT_PATH)
        const relativeToInput = relative(fileURLToPath(inputDir), fileURLToPath(linguiDir))

        const languages = getLanguageFamilyName(
            (await readdir(inputDir, { withFileTypes: true })).filter((x) => x.isFile()).map((x) => x.name),
        )
        const linguiLanguages =
            (await exists(linguiDir)) ?
                getLanguageFamilyName(
                    (await readdir(linguiDir, { withFileTypes: true })).filter((x) => x.isFile()).map((x) => x.name),
                )
            :   new Map<string, string>()

        {
            let code = header
            code += `\nexport * from './i18n_generated.js'\n`
            code = await prettier(code)
            await writeFile(new URL('index.ts', inputDir), code, { encoding: 'utf8' })
        }

        {
            let code = header
            for (const [language] of languages) {
                code += `import ${language.replace('-', '_')} from './${language}.json'\n`
            }
            for (const [language] of linguiLanguages) {
                code += `import lingui_${language.replace('-', '_')} from '${relativeToInput}/${language}.json'\n`
            }
            code += `export const languages = {\n`
            for (const [language, familyName] of languages) {
                code += `    '${familyName}': ${language.replace('-', '_')},\n`
            }
            code += `}\n`
            if (linguiLanguages.size) {
                code += `export const linguiLanguages = {\n`
                for (const [language, familyName] of linguiLanguages) {
                    code += `    '${familyName}': lingui_${language.replace('-', '_')},\n`
                }
                code += `}\n`
            }
            // Non-plugin i18n files
            if (!namespace.includes('.')) {
                const target = `@masknet/shared-base`
                code += `import { createI18NBundle } from '${target}'\n`
                code += `export const add${upperFirst(namespace)}I18N = createI18NBundle('${namespace}', ${linguiLanguages.size ? '[languages, linguiLanguages as any]' : 'languages'})\n`
            }

            {
                const allImportPath: string[] = []
                const linguiImportPath: string[] = []
                const binding: string[] = []
                const linguiBinding: string[] = []
                for (const [language, familyName] of languages) {
                    allImportPath.push(`./${language}.json`)
                    binding.push(`'${familyName}': ${language.replace('-', '_')}`)
                }
                for (const [language, familyName] of linguiLanguages) {
                    linguiImportPath.push(`${relativeToInput}/${language}.json`)
                    linguiBinding.push(`'${familyName}': lingui_${language.replace('-', '_')}`)
                }
                code +=
                    `// @ts-ignore
                        if (import.meta.webpackHot) {
                            // @ts-ignore
                            import.meta.webpackHot.accept(
                                ${JSON.stringify(allImportPath)},
                                () => globalThis.dispatchEvent?.(new CustomEvent('MASK_I18N_HMR', {
                                    detail: ['${namespace}', { ${binding.join(', ')} }]
                                }))
                            )
                            ` +
                    (linguiBinding.length ?
                        `// @ts-ignore
                        import.meta.webpackHot.accept(
                            ${JSON.stringify(linguiImportPath)},
                            () => globalThis.dispatchEvent?.(new CustomEvent('MASK_I18N_HMR_LINGUI', {
                                detail: { ${linguiBinding.join(', ')} }
                            }))
                        )`
                    :   '') +
                    '}'
            }
            code = await prettier(code)
            await writeFile(new URL('languages.ts', inputDir), code, { encoding: 'utf8' })
        }
    }

    {
        const map: Record<string, string> = {}
        for (const { input, generator } of config) {
            const { namespace } = generator
            map[`${input.slice('./packages/'.length).replace('en-US', '%locale%')}`] = namespace
        }
        const code = await prettier(`${basicHeader}\nexport default ${JSON.stringify(map)}`)
        await writeFile(new URL('packages/mask/background/services/helper/i18n-cache-query-list.ts', ROOT_PATH), code, {
            encoding: 'utf8',
        })
    }
}
task(
    syncLanguages,
    'sync-languages',
    "Run this when adding a new language support or adding a new package with it's own i18n files.",
)

export function getLanguageFamilyName(_languages: string[]): Map<string, string> {
    const languages = _languages
        .filter((x) => x.endsWith('.json'))
        .sort()
        .map((x) => x.slice(0, -5))
    const languageMap = new Map<string, string>()
    const hasFamily = new Set<string>()

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
