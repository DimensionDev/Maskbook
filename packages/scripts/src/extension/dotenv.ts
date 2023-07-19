import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { ROOT_PATH } from '../utils/paths.js'
import type { BuildFlags } from './flags.js'
import { ManifestFile } from '../../../mask/.webpack/flags.js'

export function applyDotEnv(flags: BuildFlags) {
    if (flags.mode === 'production') return

    const { parsed, error } = config({ path: fileURLToPath(new URL('./.env/dev-preference', ROOT_PATH)) })
    if (error) console.error(new TypeError('Failed to parse env file', { cause: error }))
    if (!parsed) return

    flags.sourceMapPreference ??= parseBooleanOrString(parsed.sourceMap)
    if (parsed.manifest) {
        if (parsed.manifest !== '2' && parsed.manifest !== '3') {
            if (!Object.values(ManifestFile).includes(parsed.manifest as ManifestFile)) {
                throw new TypeError(`Invalid manifest version "${parsed.manifest}" specified in the env file`)
            }
        }
        flags.manifestFile ??= parseManifest(parsed.manifest as ManifestFile | '2' | '3')
    }
    flags.hmr ??= parseBoolean(parsed.hmr)
    flags.devtools ??= parseBoolean(parsed.devtools)
    flags.devtoolsEditorURI ??= parsed.devtoolsEditorURI
    flags.sourceMapHideFrameworks ??= parseBoolean(parsed.sourceMapHideFrameworks)
}
export function parseManifest(manifest: '2' | '3' | 2 | 3 | undefined | ManifestFile) {
    if (manifest === 2 || manifest === '2') return ManifestFile.ChromiumMV2
    if (manifest === 3 || manifest === '3') return ManifestFile.ChromiumMV3
    if (typeof manifest === 'string') return manifest
    return ManifestFile.ChromiumMV2
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
