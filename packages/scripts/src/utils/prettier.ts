import { Config, format, resolveConfig } from 'prettier'
import { ROOT_PATH } from './paths'

export async function prettier(code: string, parser: Config['parser'] = 'typescript') {
    const config = await resolveConfig(ROOT_PATH, { editorconfig: true })
    return format(code, {
        ...config,
        parser,
        tabWidth: 4,
    })
}
