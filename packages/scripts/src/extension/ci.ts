#!/usr/bin/env ts-node
import { fileURLToPath } from 'url'
import { series, type TaskFunction } from 'gulp'
import { buildBaseExtension } from './normal.js'
import { ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { type BuildFlagsExtended } from './flags.js'
import { copyFile } from 'fs/promises'
import { ManifestFile } from '../../../mask/.webpack/flags.js'

const BUILD_PATH = new URL('build/', ROOT_PATH)
export const ciBuild: TaskFunction = series(
    codegen,
    buildBaseExtension,
    zipTo('MaskNetwork.chromium.zip', ManifestFile.ChromiumMV2),
    zipTo('MaskNetwork.firefox.zip', ManifestFile.FirefoxMV2, true),
    zipTo('MaskNetwork.firefox-mv3.zip', ManifestFile.FirefoxMV3, true),
    zipTo('MaskNetwork.chromium-beta.zip', ManifestFile.ChromiumBetaMV2),
    zipTo('MaskNetwork.chromium-mv3.zip', ManifestFile.ChromiumMV3),
)
task(ciBuild, 'build-ci', 'Build the extension on CI')
function zipTo(
    fileName: string,
    withManifestFile: BuildFlagsExtended['manifestFile'],
    reproducible?: boolean,
): TaskFunction {
    const f: TaskFunction = async () => {
        await copyFile(new URL(`manifest-${withManifestFile}.json`, BUILD_PATH), new URL('manifest.json', BUILD_PATH))
        if (!reproducible && withManifestFile === ManifestFile.ChromiumBetaMV2) {
            await copyFile(new URL('build-info-beta.json', BUILD_PATH), new URL('build-info.json', BUILD_PATH))
        }
        const { cmd } = await import('web-ext')
        await cmd.build({
            sourceDir: fileURLToPath(BUILD_PATH),
            artifactsDir: fileURLToPath(ROOT_PATH),
            filename: fileName,
            overwriteDest: true,
            ignoreFiles: ['*/*.map', reproducible ? 'build-info.json' : undefined!].filter(Boolean),
        })
    }
    f.displayName = `Build extension zip at ${fileName}`
    return f
}
