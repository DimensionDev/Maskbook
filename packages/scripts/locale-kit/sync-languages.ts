import { readdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { ROOT_PATH } from '../utils/paths.ts'
import { prettier } from '../utils/prettier.ts'
import { getLanguageFamilyName } from './getLanguageFamilyName.ts'
import { glob } from 'glob'

const basicHeader = `// This file is auto generated. DO NOT EDIT
// Run \`pnpm run sync-languages\` to regenerate.`
const header = `${basicHeader}
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please edit it in packages/scripts/locale-kit/getLanguageFamilyName
`
await syncLanguages()

async function syncLanguages() {
    const poFiles = await glob('**/en-US.po', { cwd: ROOT_PATH })
    for (const poFile of poFiles) {
        const inputDir = new URL(dirname(poFile) + '/', ROOT_PATH)
        const languages = getLanguageFamilyName(
            (await readdir(inputDir, { withFileTypes: true })).filter((x) => x.isFile()).map((x) => x.name),
        )

        {
            let code = header
            for (const [language] of languages) {
                code += `import ${language.replace('-', '_')} from './${language}.json' with { type: 'json' }\n`
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
                code += `export const addI18N = createI18NBundle(languages as any)\n`
            }

            {
                const allImportPath: string[] = []
                const binding: string[] = []
                for (const [language, familyName] of languages) {
                    allImportPath.push(`./${language}.json`)
                    binding.push(`'${familyName}': ${language.replace('-', '_')}`)
                }
                code += `// @ts-ignore
                        import.meta.webpackHot?.accept(
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

    {
        const map: Record<string, string> = {}
        const code = await prettier(`${basicHeader}\nexport default ${JSON.stringify(map)}`)
        await writeFile(new URL('packages/mask/background/services/helper/i18n-cache-query-list.ts', ROOT_PATH), code, {
            encoding: 'utf8',
        })
    }
}
