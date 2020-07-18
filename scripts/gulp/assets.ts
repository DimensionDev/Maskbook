import { src, dest, watch, lastRun } from 'gulp'
import * as modifier from '../manifest.overrides'
import { modifyFile, named } from './helper'
import { assetsPath, output, manifestPath } from './paths'
// @ts-ignore
import minimist from 'minimist'

export function assets() {
    return src(assetsPath.files, { since: lastRun(assets) }).pipe(dest(output.extension.folder))
}
named(assets.name, assets, 'Copy all assets to the extension folder (build)')
export const watchAssets = named(
    'watch-assets',
    () => watch(assetsPath.folder, { ignoreInitial: false }, assets),
    'Copy all assets to the extension folder (watch)',
)

const opts = {
    string: 'target',
    default: { target: 'chromium' },
}
const options = minimist(process.argv.slice(2), opts)

const modify = (watch: boolean) => (x: string): string => {
    const obj = JSON.parse(x)
    if (watch) modifier.development(obj)
    const target = options.target
    // @ts-ignore
    if (target in modifier) modifier[target](obj)
    else throw new Error(`Unknown target ${target}, known targets: ${Object.keys(modifier).join(', ')}`)
    return JSON.stringify(obj, void 0, 4)
}
export function manifest() {
    return src(manifestPath.file)
        .pipe(modifyFile(modify(false)))
        .pipe(dest(output.extension.folder))
}
named(manifest.name, manifest, 'Generate the extension manifest based on the build target (build)')
export const watchManifest = named(
    'watch-manifest',
    () =>
        watch(manifestPath.file, { ignoreInitial: false }, function watch_manifest_inner() {
            return src(manifestPath.file)
                .pipe(modifyFile(modify(false)))
                .pipe(dest(output.extension.folder))
        }),
    'Generate the extension manifest based on the build target (watch)',
)
