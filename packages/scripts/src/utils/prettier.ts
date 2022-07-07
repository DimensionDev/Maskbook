import { format, Options, resolveConfig, resolveConfigFile } from 'prettier'
import { ROOT_PATH } from './paths'

export async function prettier(code: string, parser: Options['parser'] = 'typescript') {
    const configPath = await resolveConfigFile(ROOT_PATH)
    const config = configPath ? await resolveConfig(configPath) : {}
    return format(code, {
        ...config,
        parser,
        tabWidth: 4,
    })
}
