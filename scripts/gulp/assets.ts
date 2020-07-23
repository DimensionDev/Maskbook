import { src, dest, watch, lastRun } from 'gulp'
import * as modifier from './manifest.overrides'
import { createTask, modifyFile, named } from './helper'
import { assetsPath, output, manifestPath, srcPath } from './paths'
import { buildTarget, getEnvironment } from './env'
// @ts-ignore
import rename from 'gulp-rename'

const sourceAssetsDesc =
    'Copy all assets allocated in src/* to extension/esm/* to enable them to be used by import.meta'
export function srcAssets() {
    return src(
        [
            srcPath.files,
            `!${srcPath.relative('./**/*.ts')}`,
            `!${srcPath.relative('./**/*.tsx')}`,
            `!${srcPath.relative('./**/*.js')}`,
        ],
        {
            since: lastRun(srcAssets),
        },
    ).pipe(dest(output.esmBuildClone.folder))
}
named('src-assets', sourceAssetsDesc + ' (build)', srcAssets)
export const watchSrcAssets = named('watch-src-assets', sourceAssetsDesc + ' (watch)', () =>
    watch(srcPath.folder, { ignoreInitial: true, ignored: ['*.ts', '*.tsx'] }, srcAssets),
)

export function assets() {
    return src(assetsPath.files, { since: lastRun(assets) }).pipe(dest(output.extension.folder))
}
named(assets.name, 'Copy all assets to the extension folder (build)', assets)
export const watchAssets = named('watch-assets', 'Copy all assets to the extension folder (watch)', () =>
    watch(assetsPath.folder, { ignoreInitial: false }, assets),
)

const modify = (watch: boolean) => (x: string): string => {
    const obj = JSON.parse(x)
    if (watch) modifier.development(obj)
    modifier[buildTarget](obj)
    return JSON.stringify(obj, void 0, 4)
}
export function manifest() {
    return src(manifestPath.file)
        .pipe(modifyFile(modify(false)))
        .pipe(dest(output.extension.folder))
}
named(manifest.name, 'Generate the extension manifest based on the build target (build)', manifest)
export const watchManifest = named(
    'watch-manifest',
    'Generate the extension manifest based on the build target (watch)',
    () =>
        watch(manifestPath.file, { ignoreInitial: false }, function watch_manifest_inner() {
            return src(manifestPath.file)
                .pipe(modifyFile(modify(false)))
                .pipe(dest(output.extension.folder))
        }),
)

export const { build: environmentFile, watch: watchEnvironmentFile } = createTask(
    'environment-file',
    'Create a env.js in the output folder for environment variables',
    (mode) => () =>
        src(manifestPath.file)
            .pipe(
                modifyFile(
                    (x) => `globalThis.process = {};
globalThis.process.env = ${JSON.stringify(getEnvironment(mode))};`,
                ),
            )
            .pipe(rename('env.js'))
            .pipe(dest(output.extension.folder)),
)
