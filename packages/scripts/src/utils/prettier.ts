import type { Options } from 'prettier'
import { ROOT_PATH } from './paths.js'

export async function prettier(code: string, parser: Options['parser'] = 'typescript', tabWidth = 4) {
    const {
        default: { format, resolveConfig, resolveConfigFile },
    } = await (import('prettier') as Promise<{ default: typeof import('prettier') }>)
    const configPath = await resolveConfigFile(ROOT_PATH)
    const config = configPath ? await resolveConfig(configPath) : {}
    return format(code, {
        ...config,
        parser,
        tabWidth,
    })
}
