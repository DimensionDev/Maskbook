import type { Options } from 'prettier'
import { ROOT_PATH } from './paths.js'

export async function prettier(code: string, parser: Options['parser'] = 'typescript', tabWidth = 4) {
    const {
        default: { format, resolveConfig, resolveConfigFile },
    } = await (import('prettier') as Promise<{ default: typeof import('prettier') }>)
    // https://github.com/prettier/prettier/issues/16344
    // const configPath = await resolveConfigFile(ROOT_PATH)
    const configPath = new URL('.prettierrc', ROOT_PATH)
    const config = await resolveConfig(configPath)
    return format(code, {
        ...config,
        parser,
        tabWidth,
    })
}
