import yargs, { Argv } from 'yargs'
const { hideBin } = require('yargs/helpers')
import { spawn } from 'child_process'
import { compact } from 'lodash'
import { resolve } from 'path'
import { awaitChildProcess, PKG_PATH, watchTask } from '../utils'
import { buildInjectedScript, watchInjectedScript } from '../projects/injected-scripts'
import { buildMaskSDK, watchMaskSDK } from '../projects/mask-sdk'

const presets = ['chromium', 'firefox', 'android', 'iOS', 'base'] as const
const otherFlags = ['beta', 'insider', 'reproducible', 'profile', 'manifest-v3', 'readonlyCache', 'progress'] as const

export async function extension(f?: Function | ExtensionBuildArgs) {
    await buildInjectedScript()
    await buildMaskSDK()
    if (typeof f === 'function') return awaitChildProcess(webpack('build'))
    return awaitChildProcess(webpack('build', f))
}
export async function extensionWatch(f?: Function | ExtensionBuildArgs) {
    watchInjectedScript()
    watchMaskSDK()
    if (typeof f === 'function') return awaitChildProcess(webpack('dev'))
    return awaitChildProcess(webpack('dev', f))
}
watchTask(extension, extensionWatch, 'webpack', 'Build Mask Network extension', {
    '[Warning]': 'For normal development, use task "dev" or "build"',
})

function parseArgs() {
    const a = yargs(hideBin(process.argv))
    for (const i of presets) a.option(i, { type: 'boolean', description: `Build under preset ${i}` })
    for (const i of otherFlags) a.option(i, { type: 'boolean', description: `Build with flag ${i}` })
    const b = a as Argv<Record<typeof presets[number] | typeof otherFlags[number], boolean>>
    return b.string('output-path')
}
export type ExtensionBuildArgs = Partial<ReturnType<typeof parseArgs>['argv']>
function webpack(mode: 'dev' | 'build', args: ExtensionBuildArgs = parseArgs().argv) {
    const command = [
        'webpack',
        mode === 'dev' ? 'serve' : undefined,
        '--mode',
        mode === 'dev' ? 'development' : 'production',
        args.progress && '--progress',
    ]
    for (const knownTarget of [...presets, ...otherFlags]) {
        if (args[knownTarget]) command.push('--env', knownTarget)
    }
    if (args['output-path']) command.push('--output-path', args['output-path'])
    return spawn('npx', compact(command), {
        cwd: resolve(PKG_PATH, 'maskbook'),
        stdio: 'inherit',
        shell: true,
    })
}
