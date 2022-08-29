import yargs from 'yargs'
import type { ExtensionBuildArgs } from '../extension/index.js'
import { hideBin } from 'yargs/helpers'

const presets = ['chromium', 'firefox', 'android', 'iOS', 'base'] as const
export function extensionArgsParser() {
    const opts = yargs(hideBin(process.argv))
        .options('preset', {
            type: 'string',
            choices: [...presets] as typeof presets[number][],
            description: 'Select which preset to build',
        })
        .conflicts('beta', 'insider')
        .options('beta', { type: 'boolean', description: 'Build beta version' })
        .options('insider', { type: 'boolean', description: 'Build insider version' })
        .options('reproducible', { type: 'boolean', description: 'Build a reproducible build' })
        .options('profile', { type: 'boolean', description: 'Build a profile build' })
        .options('mv3', {
            type: 'boolean',
            description: 'Build in manifest-v3 mode (Not working!)',
        })
        .options('readonlyCache', {
            type: 'boolean',
            description: 'Do not write Webpack filesystem cache during the build',
        })
        .options('progress', {
            type: 'boolean',
            description: 'Show build progress',
        })
        .hide('version')
        .strict().argv

    if (opts instanceof Promise) throw new TypeError()
    const extensionOpts: ExtensionBuildArgs = {
        mv3: opts.mv3,
        android: opts.preset === 'android',
        chromium: opts.preset === 'chromium',
        firefox: opts.preset === 'firefox',
        iOS: opts.preset === 'iOS',
        beta: opts.beta,
        insider: opts.insider,
        profile: opts.profile,
        readonlyCache: opts.readonlyCache,
        reproducible: opts.reproducible,
        progress: opts.progress,
    }
    for (const i in extensionOpts) {
        if (!(extensionOpts as any)[i]) delete (extensionOpts as any)[i]
    }
    return extensionOpts
}
