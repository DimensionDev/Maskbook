#!/usr/bin/env ts-node
import { fileURLToPath } from 'url'
import { series, type TaskFunction } from 'gulp'
import { buildBaseExtension } from './normal.js'
import { ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { type BuildFlagsExtended } from './flags.js'
import { copyFile } from 'fs/promises'

const BUILD_PATH = new URL('build/', ROOT_PATH)
export const ciBuild: TaskFunction = series(
    codegen,
    buildBaseExtension,
    zipTo('MaskNetwork.chromium.zip', 'chromium-mv2'),
    zipTo('MaskNetwork.firefox.zip', 'firefox-mv2'),
    zipTo('MaskNetwork.firefox-mv3.zip', 'firefox-mv3'),
    zipTo('MaskNetwork.chromium-beta.zip', 'chromium-beta-mv2'),
    zipTo('MaskNetwork.chromium-mv3.zip', 'chromium-mv3'),
)
task(ciBuild, 'build-ci', 'Build the extension on CI')
function zipTo(fileName: string, withManifestFile: BuildFlagsExtended['mainManifestFile']): TaskFunction {
    const f: TaskFunction = async () => {
        await copyFile(new URL(`manifest-${withManifestFile}.json`, BUILD_PATH), new URL('manifest.json', BUILD_PATH))
        const { cmd } = await import('web-ext')
        await cmd.build({
            sourceDir: fileURLToPath(BUILD_PATH),
            artifactsDir: fileURLToPath(ROOT_PATH),
            filename: fileName,
            overwriteDest: true,
            ignoreFiles: ['*/*.map'],
        })
    }
    f.displayName = `Build extension zip at ${fileName}`
    return f
}
