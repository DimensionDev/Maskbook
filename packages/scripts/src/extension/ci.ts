#!/usr/bin/env ts-node
import { extension as buildBaseVersion, ExtensionBuildArgs } from './normal.js'
import { series, parallel, TaskFunction } from 'gulp'
import { ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { fileURLToPath } from 'url'

const BUILD_PATH = new URL('build', ROOT_PATH)
export const ciBuild = series(
    printBranchName,
    codegen,
    // The base version need to be build in serial in order to prepare webpack cache.
    buildBaseVersion,
    // If we build parallel on CI, it will be slower eventually
    (process.env.CI ? series : parallel)(
        // zip base version to zip
        zipTo(BUILD_PATH, 'MaskNetwork.base.zip'),
        // Chrome version is the same with base version
        zipTo(BUILD_PATH, 'MaskNetwork.chromium.zip'),
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
    options['output-path'] = fileURLToPath(new URL(options['output-path']!, ROOT_PATH))
    return series(buildWith(name, options), zipTo(options['output-path']!, outFile))
}
function zipTo(absBuildDir: URL, fileName: string): TaskFunction {
    const f: TaskFunction = async () => {
        const { cmd } = await import('web-ext')
        cmd.build({
            sourceDir: fileURLToPath(absBuildDir),
            artifactsDir: fileURLToPath(ROOT_PATH),
            filename: fileName,
            overwriteDest: true,
        })
    }
    f.displayName = `zip ${absBuildDir} into ${fileName}`
    return f
}
function buildWith(name: string, buildArgs: ExtensionBuildArgs) {
    const f: TaskFunction = () => buildBaseVersion(buildArgs)
    f.displayName = `Build target ${name}`
    return f
}

async function printBranchName() {
    const { default: git } = await import('@nice-labs/git-rev')
    console.log('Building on branch: ', git.branchName())
}
