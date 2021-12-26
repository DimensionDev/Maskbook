import yargs from 'yargs'
import type { ExtensionBuildArgs } from '../extension'

const { hideBin } = require('yargs/helpers')
const presets = ['chromium', 'firefox', 'android', 'iOS', 'base'] as const
export function extensionArgsParser() {
    const opts = yargs(hideBin(process.argv))
        .options<'preset', { choices: typeof presets[number][] }>('preset', {
            // @ts-ignore
            type: 'string',
            choices: [...presets],
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
        if (!extensionOpts[i]) delete extensionOpts[i]
    }
    return extensionOpts
}
