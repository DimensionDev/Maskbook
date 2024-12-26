#!/usr/bin/env node --import swc-register-esm
import { fileURLToPath } from 'node:url'
import { ROOT_PATH } from '../utils/paths.ts'
import { type BuildFlagsExtended } from './flags.ts'
import { copyFile } from 'node:fs/promises'
import { ManifestFile } from '../../mask/.webpack/flags.ts'

const BUILD_PATH = new URL('build/', ROOT_PATH)

function zipTo(fileName: string, withManifestFile: BuildFlagsExtended['manifestFile'], reproducible?: boolean) {
    return async () => {
        await copyFile(new URL(`manifest-${withManifestFile}.json`, BUILD_PATH), new URL('manifest.json', BUILD_PATH))
        if (!reproducible && withManifestFile === ManifestFile.ChromiumBetaMV3) {
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
}
