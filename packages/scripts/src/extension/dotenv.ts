import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { ROOT_PATH } from '../utils/paths.js'
import type { BuildFlags } from './flags.js'

export function applyDotEnv(flags: BuildFlags) {
    if (flags.mode === 'production') return

    const { parsed, error } = config({ path: fileURLToPath(new URL('./.env/dev-preference', ROOT_PATH)) })
    if (error) console.error(new TypeError('Failed to parse env file', { cause: error }))
    if (!parsed) return

    flags.sourceMapPreference ??= parseBooleanOrString(parsed.sourceMap)
    if (parsed.manifest) {
        if (parsed.manifest === '2') flags.manifest ??= 2
        else if (parsed.manifest === '3') flags.manifest ??= 3
        throw new TypeError(`Invalid manifest version "${parsed.manifest}" specified in the env file`)
    }
    flags.hmr ??= parseBoolean(parsed.hmr)
    flags.devtools ??= parseBoolean(parsed.devtools)
    flags.devtoolsEditorURI ??= parsed.devtoolsEditorURI
    flags.sourceMapHideFrameworks ??= parseBoolean(parsed.sourceMapHideFrameworks)
}
function parseBoolean(val: string | undefined) {
    if (val === undefined) return undefined
    else if (val === 'true') return true
    else if (val === 'false') return false
    throw new TypeError(`Unexpected value "${val}" in env file, expected true or false.`)
}
function parseBooleanOrString(val: string | undefined) {
    if (val === 'true') return true
    else if (val === 'false') return false
    return val
}
