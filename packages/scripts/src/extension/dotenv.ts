import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { ROOT_PATH } from '../utils/paths.js'
import type { BuildFlags } from './flags.js'

export function applyDotEnv(flags: BuildFlags) {
    if (flags.mode === 'production') return

    const { parsed } = config({ path: fileURLToPath(new URL('./.env/dev-preference', ROOT_PATH)) })
    if (!parsed) return

    if ('sourceMap' in parsed && flags.sourceMapPreference === undefined) {
        flags.sourceMapPreference =
            parsed.sourceMap === 'true' ? true : parsed.sourceMap === 'false' ? false : parsed.sourceMap
    }
    if (parsed.manifest && flags.manifest === undefined) {
        if (parsed.manifest === '2') flags.manifest = 2
        else if (parsed.manifest === '3') flags.manifest = 3
    }
    if (parsed.hmr === 'false' && flags.hmr === undefined) flags.hmr = false
    if (parsed.devtools === 'false' && flags.devtools === undefined) flags.devtools = false
    if (parsed.devtoolsEditorURI) {
        flags.devtoolsEditorURI = parsed.devtoolsEditorURI
    }
}
