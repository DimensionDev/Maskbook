import yargs from 'yargs'
import type { BuildFlagsExtended } from '../extension/flags.js'
import { hideBin } from 'yargs/helpers'
import { applyDotEnv, parseManifest } from '../extension/dotenv.js'
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

        .options('progress', { type: 'boolean', description: 'Show build progress' })
        .options('hmr', { type: 'boolean', description: 'Enable Hot Module Reload' })
        .options('reactRefresh', { type: 'boolean', description: 'Enable react-refresh', implies: 'hmr' })
        .options('csp', { type: 'boolean', description: 'Enable strict contentScript.' })
        .options('lavamoat', { type: 'boolean', description: 'Enable LavaMoat.' })
        .option('reactCompiler', {
            type: 'string',
            coerce(arg) {
                if (arg === 'true') return true
                if (arg === 'false') return false
                if (arg === 'infer' || arg === 'annotation' || arg === 'all') return arg
                throw new TypeError(`Invalid value "${arg}" for reactCompiler`)
            },
            description: 'Enable react compiler',
        })
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
        manifestFile: opts.manifest ? parseManifest(opts.manifest) : undefined,
        mode,
        outputPath: opts.output,
        channel:
            opts.beta ? 'beta'
            : opts.insider ? 'insider'
            : 'stable',
        profiling: opts.profile,
        progress: opts.progress,
        hmr: opts.hmr,
        reactRefresh: opts.reactRefresh,
        reactCompiler: opts.reactCompiler,
        lavamoat: opts.lavamoat,
        csp: opts.csp,
        devtools: opts.devtools,
        devtoolsEditorURI: opts.devtoolsEditorURI,
        sourceMapPreference: opts.sourceMap,
        sourceMapHideFrameworks: opts.sourceMapHideFrameworks,
    }
    applyDotEnv(extensionOpts)
    return extensionOpts
}
