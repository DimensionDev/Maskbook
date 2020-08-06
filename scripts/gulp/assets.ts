import { src, dest, watch } from 'gulp'
import * as modifier from './manifest.overrides'
import { copyOnChange, createTask, modifyFile, named } from './helper'
import { assetsPath, output, manifestPath, srcPath } from './paths'
import { buildTarget, getEnvironment } from './env'
import rename from 'gulp-rename'
import changed from 'gulp-changed'

export const [srcAssets, watchSrcAssets] = copyOnChange({
    name: 'src-assets',
    desc: 'Copy all assets to the extension folder',
    from: [
        [
            srcPath.files,
            `!${srcPath.relative('./**/*.ts')}`,
            `!${srcPath.relative('./**/*.tsx')}`,
            `!${srcPath.relative('./**/*.js')}`,
        ],
    ],
    to: output.esmBuildClone.folder,
    watch: [srcPath.folder, { ignored: ['*.ts', '*.tsx'] }],
})

export const [assets, watchAssets] = copyOnChange({
    name: 'assets',
    desc: 'Copy all assets to the extension folder',
    from: [[assetsPath.files, `!${assetsPath.relative('./**/*.html')}`]],
    to: output.extension.folder,
    watch: [assetsPath.folder],
})

const modify = (watch: boolean) => (x: string): string => {
    const obj = JSON.parse(x)
    if (watch) modifier.development(obj)
    else modifier.production(obj)
    modifier[buildTarget](obj)
    return JSON.stringify(obj, void 0, 4)
}
export function manifest() {
    return src(manifestPath.file)
        .pipe(modifyFile(modify(false)))
        .pipe(changed(output.extension.folder))
        .pipe(dest(output.extension.folder))
}
named(manifest.name, 'Generate the extension manifest based on the build target (build)', manifest)
export const watchManifest = named(
    'watch-manifest',
    'Generate the extension manifest based on the build target (watch)',
    () =>
        watch(manifestPath.file, { ignoreInitial: false }, function manifest() {
            return (
                src(manifestPath.file)
                    // Notify the true. this is different than the fn manifest above.
                    .pipe(modifyFile(modify(true)))
                    .pipe(changed(output.extension.folder))
                    .pipe(dest(output.extension.folder))
            )
        }),
)

export const [environmentFile, watchEnvironmentFile] = createTask(
    'environment-file',
    'Create a env.js in the output folder for environment variables',
    (mode) => () =>
        src(manifestPath.file)
            .pipe(
                modifyFile(
                    (x) => `
                        globalThis.process = {};
                        globalThis.process.env = ${JSON.stringify(getEnvironment(mode))};
                    `,
                ),
            )
            .pipe(rename('env.js'))
            .pipe(changed(output.extension.folder))
            .pipe(dest(output.extension.folder)),
)
