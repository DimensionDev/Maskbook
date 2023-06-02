#!/usr/bin/env ts-node
import { buildBaseExtension, buildWebpackFlag } from './normal.js'
import { series, parallel, type TaskFunction, src, dest } from 'gulp'
import { ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { fileURLToPath } from 'url'
import { buildSandboxedPluginConfigurable } from '../projects/sandboxed-plugins.js'
import { join } from 'path'
import { type BuildFlagsExtended, getPreset, Preset } from './flags.js'

const BUILD_PATH = new URL('build/', ROOT_PATH)
export const ciBuild: TaskFunction = series(
    codegen,
    // function buildSandboxedPlugin() {
    //     return buildSandboxedPluginConfigurable(fileURLToPath(BUILD_PATH), true)
    // },
    // We need to build a version in serial to prepare the webpack cache.
    buildBaseExtension,
    parallel(
        zipTo(BUILD_PATH, 'MaskNetwork.chromium.zip'),
        buildTarget(
            'Firefox',
            { ...getPreset(Preset.Firefox), outputPath: 'build-firefox' },
            'MaskNetwork.firefox.zip',
        ),
        buildTarget(
            'Chromium-beta',
            { ...getPreset(Preset.Chromium), channel: 'beta', outputPath: 'build-chromium-beta' },
            'MaskNetwork.chromium-beta.zip',
        ),
        buildTarget(
            'Chromium-MV3',
            { ...getPreset(Preset.Chromium), manifest: 3, outputPath: 'build-mv3' },
            'MaskNetwork.chromium-mv3.zip',
        ),
    ),
)
task(ciBuild, 'build-ci', 'Build the extension on CI')
function buildTarget(name: string, options: Omit<BuildFlagsExtended, 'mode'>, outFile: string) {
    options.readonlyCache = true
    const output = new URL(options.outputPath!, ROOT_PATH)
    const outputFolder = (options.outputPath = fileURLToPath(output))

    const copySandboxModules: TaskFunction = () =>
        src('sandboxed-modules/**/*', {
            cwd: fileURLToPath(BUILD_PATH),
        }).pipe(dest(join(outputFolder, 'sandboxed-modules/')))
    copySandboxModules.displayName = `Copy sandboxed modules to ${outputFolder}`

    return series(
        buildWebpackFlag(name, { ...options, mode: 'production' }),
        copySandboxModules,
        zipTo(output, outFile),
    )
}
function zipTo(absBuildDir: URL, fileName: string): TaskFunction {
    const f: TaskFunction = async () => {
        const { cmd } = await import('web-ext')
        await cmd.build({
            sourceDir: fileURLToPath(absBuildDir),
            artifactsDir: fileURLToPath(ROOT_PATH),
            filename: fileName,
            overwriteDest: true,
            ignoreFiles: ['*/*.map'],
        })
    }
    f.displayName = `Build extension zip at ${fileName}`
    return f
}
