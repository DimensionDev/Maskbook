import { config } from 'dotenv'
import { ROOT_PATH } from '../utils/paths.ts'
import type { BuildFlags } from './flags.ts'
import { ManifestFile } from '../../../mask/.webpack/flags.ts'

export function applyDotEnv(flags: BuildFlags) {
    const { parsed, error } = config({ path: new URL('./.env/dev-preference', ROOT_PATH) })
    if (error && !error.message.includes('no such file or directory')) {
        console.error(new TypeError('Failed to parse env file', { cause: error }))
    }
    flags.FIREFLY_X_CLIENT_ID ??= process.env.FIREFLY_X_CLIENT_ID
    flags.FIREFLY_X_CLIENT_SECRET ??= process.env.FIREFLY_X_CLIENT_SECRET

    if (!parsed || flags.mode === 'production') return

    flags.sourceMapPreference ??= parseBooleanOrString(parsed.sourceMap)
    if (parsed.manifest) {
        if (parsed.manifest !== '3' && !Object.values(ManifestFile).includes(parsed.manifest as ManifestFile)) {
            throw new TypeError(`Invalid manifest version "${parsed.manifest}" specified in the env file`)
        }
        flags.manifestFile ??= parseManifest(parsed.manifest as ManifestFile)
    }
    flags.hmr ??= parseBoolean(parsed.hmr)
    flags.devtools ??= parseBoolean(parsed.devtools)
    flags.devtoolsEditorURI ??= parsed.devtoolsEditorURI
    const compiler = parseBooleanOrString(parsed.reactCompiler)
    if (typeof compiler === 'string' && compiler !== 'infer' && compiler !== 'annotation' && compiler !== 'all')
        throw new TypeError(`Invalid reactCompiler value "${compiler}" in env file`)
    flags.reactCompiler ??= compiler
    flags.lavamoat ??= parseBoolean(parsed.lavamoat)
    flags.csp ??= parseBoolean(parsed.csp)
    flags.sourceMapHideFrameworks ??= parseBoolean(parsed.sourceMapHideFrameworks)
}
export function parseManifest(manifest: 3 | undefined | ManifestFile) {
    if (manifest === 3 || manifest === '3') return ManifestFile.ChromiumMV3
    if (typeof manifest === 'string') return manifest
    return ManifestFile.ChromiumMV3
}
function parseBoolean(val: string | undefined) {
    if (val === undefined) return
    else if (val === 'true') return true
    else if (val === 'false') return false
    throw new TypeError(`Unexpected value "${val}" in env file, expected true or false.`)
}
function parseBooleanOrString(val: string | undefined) {
    if (val === 'true') return true
    else if (val === 'false') return false
    return val
}
