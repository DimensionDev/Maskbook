import type { Options } from 'prettier'
import { ROOT_PATH } from './paths.js'
import { fileURLToPath } from 'url'

export async function prettier(code: string, parser: Options['parser'] = 'typescript', tabWidth = 4) {
    const {
        default: { format, resolveConfig, resolveConfigFile },
    } = await (import('prettier') as Promise<{ default: typeof import('prettier') }>)
    const configPath = await resolveConfigFile(fileURLToPath(ROOT_PATH))
    const config = configPath ? await resolveConfig(configPath) : {}
    return format(code, {
        ...config,
        parser,
        tabWidth,
    })
}
