import yargs from 'yargs'
import type { BuildFlagsExtended } from '../extension/flags.js'
import { hideBin } from 'yargs/helpers'
import { applyPresetEnforce } from '../extension/flags.js'
import { applyDotEnv } from '../extension/dotenv.js'
import { ManifestFile } from '../../../mask/.webpack/flags.js'

const manifestFiles = Object.values(ManifestFile)
export function extensionArgsParser(mode: 'development' | 'production') {
    const opts = yargs(hideBin(process.argv))
        .options('output', { type: 'string', normalize: true, description: 'Output folder' })
        .conflicts('beta', 'insider')
        .options('beta', { type: 'boolean', description: 'Build beta version' })
        .options('insider', { type: 'boolean', description: 'Build insider version' })

        .options('manifest', {
            type: 'string',
            choices: ['2', '3', ...manifestFiles] as const,
            description: 'Select which manifest file/version to use',
        })

        .options('profile', { type: 'boolean', description: 'Build a profile build' })
        .options('reproducible', { type: 'boolean', description: 'Build a reproducible build' })

        .options('progress', { type: 'boolean', description: 'Show build progress' })
        .options('hmr', { type: 'boolean', description: 'Enable Hot Module Reload' })
        .options('reactRefresh', { type: 'boolean', description: 'Enable react-refresh', implies: 'hmr' })
        .options('devtools', { type: 'boolean', description: 'Enable devtools' })
        .options('devtoolsEditorURI', { type: 'string', description: 'Editor URI to be used in React Devtools.' })
        .options('sourceMap', {
            type: 'string',
            description: 'Enable source map',
            coerce(arg) {
                if (arg === '') return true
                if (arg === 'false') return false
                return arg
            },
        })
        .options('sourceMapHideFrameworks', {
            type: 'boolean',
            description: 'Hide node_modules and webpack internal stack when using sourceMap',
        })

        .hide('version')
        .strict().argv

    if (opts instanceof Promise) throw new TypeError()
    const extensionOpts: BuildFlagsExtended = {
        manifestFile:
            opts.manifest === '2'
                ? ManifestFile.ChromiumMV2
                : opts.manifest === '3'
                ? ManifestFile.ChromiumMV3
                : opts.manifest || ManifestFile.ChromiumMV2,
        mode,
        outputPath: opts.output,
        channel: opts.beta ? 'beta' : opts.insider ? 'insider' : 'stable',
        profiling: opts.profile,
        reproducibleBuild: opts.reproducible,
        progress: opts.progress,
        hmr: opts.hmr,
        reactRefresh: opts.reactRefresh,
        devtools: opts.devtools,
        devtoolsEditorURI: opts.devtoolsEditorURI,
        sourceMapPreference: opts.sourceMap,
        sourceMapHideFrameworks: opts.sourceMapHideFrameworks,
    }
    applyDotEnv(extensionOpts)
    applyPresetEnforce(extensionOpts)
    return extensionOpts
}
