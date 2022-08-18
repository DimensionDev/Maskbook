#!/usr/bin/env ts-node
import { buildBaseExtension, ExtensionBuildArgs, buildWebpackFlag } from './normal.js'
import { series, parallel, TaskFunction, src, dest } from 'gulp'
import { ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { fileURLToPath } from 'url'
import { buildSandboxedPluginConfigurable } from '../projects/sandboxed-plugins.js'
import { join } from 'path'

const BUILD_PATH = new URL('build/', ROOT_PATH)
export const ciBuild: TaskFunction = series(
    codegen,
    // The base version need to be build in serial in order to prepare webpack cache.
    buildBaseExtension,
    function buildSandboxedPlugin() {
        return buildSandboxedPluginConfigurable(fileURLToPath(BUILD_PATH), true)
    },
    parallel(
        parallel(
            // zip base version to zip
            zipTo(BUILD_PATH, 'MaskNetwork.base.zip'),
            // Chrome version is the same with base version
            zipTo(BUILD_PATH, 'MaskNetwork.chromium.zip'),
        ),
        buildTarget('Firefox', { firefox: true, 'output-path': 'build-firefox' }, 'MaskNetwork.firefox.zip'),
        buildTarget('Android', { android: true, 'output-path': 'build-android' }, 'MaskNetwork.gecko.zip'),
        buildTarget('iOS', { iOS: true, 'output-path': 'build-iOS' }, 'MaskNetwork.iOS.zip'),
        buildTarget(
            'Chromium-beta',
            { chromium: true, beta: true, 'output-path': 'build-chromium-beta' },
            'MaskNetwork.chromium-beta.zip',
        ),
        buildTarget(
            'Chromium-MV3',
            { chromium: true, mv3: true, 'output-path': 'build-mv3' },
            'MaskNetwork.chromium-mv3.zip',
        ),
    ),
)
task(ciBuild, 'build-ci', 'Build the extension on CI')
function buildTarget(name: string, options: ExtensionBuildArgs, outFile: string) {
    options.readonlyCache = true
    const output = new URL(options['output-path']!, ROOT_PATH)
    const outputFolder = (options['output-path'] = fileURLToPath(output))

    const copySandboxModules: TaskFunction = () =>
        src('sandboxed-modules/**/*', {
            cwd: fileURLToPath(BUILD_PATH),
        }).pipe(dest(join(outputFolder, 'sandboxed-modules/')))
    copySandboxModules.displayName = `Copy sandboxed modules to ${outputFolder}`

    return series(buildWebpackFlag(name, options), copySandboxModules, zipTo(output, outFile))
}
function zipTo(absBuildDir: URL, fileName: string): TaskFunction {
    const f: TaskFunction = async () => {
        const { cmd } = await import('web-ext')
        await cmd.build({
            sourceDir: fileURLToPath(absBuildDir),
            artifactsDir: fileURLToPath(ROOT_PATH),
            filename: fileName,
            overwriteDest: true,
        })
    }
    f.displayName = `Build extension zip at ${fileName}`
    return f
}
