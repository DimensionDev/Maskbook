import yargs from 'yargs'
import type { BuildFlagsExtended } from '../extension/flags.js'
import { hideBin } from 'yargs/helpers'
import { applyPresetEnforce, getPreset, Preset } from '../extension/flags.js'
import { applyDotEnv } from '../extension/dotenv.js'

const presets = Object.values(Preset)
export function extensionArgsParser(mode: 'development' | 'production') {
    const opts = yargs(hideBin(process.argv))
        .options('preset', {
            type: 'string',
            choices: presets,
            description: 'Select which preset to build',
        })
        .options('output', { type: 'string', normalize: true, description: 'Output folder' })
        .conflicts('beta', 'insider')
        .options('beta', { type: 'boolean', description: 'Build beta version' })
        .options('insider', { type: 'boolean', description: 'Build insider version' })

        .conflicts('mv2', 'mv3')
        .options('mv2', { type: 'boolean', description: 'Build as a Manifest V2 extension' })
        .options('mv3', { type: 'boolean', description: 'Build as a Manifest V3 extension' })

        .options('profile', { type: 'boolean', description: 'Build a profile build' })
        .options('reproducible', { type: 'boolean', description: 'Build a reproducible build' })
        .options('readonlyCache', {
            type: 'boolean',
            description: 'Do not write Webpack filesystem cache during the build',
        })

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
        ...getPreset(opts.preset),
        mode,
        outputPath: opts.output,
        channel: opts.beta ? 'beta' : opts.insider ? 'insider' : 'stable',
        manifest: opts.mv3 ? 3 : opts.mv2 ? 2 : undefined,
        profiling: opts.profile,
        reproducibleBuild: opts.reproducible,
        readonlyCache: opts.readonlyCache,
        progress: opts.progress,
        hmr: opts.hmr,
        reactRefresh: opts.reactRefresh,
        devtools: opts.devtools,
        devtoolsEditorURI: opts.devtoolsEditorURI,
        sourceMapPreference: opts.sourceMap,
        sourceMapHideFrameworks: opts.sourceMapHideFrameworks,
    }
    applyDotEnv(extensionOpts)
    applyPresetEnforce(opts.preset, extensionOpts)
    return extensionOpts
}
