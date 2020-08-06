import { promisify } from 'util'
import { parallel, series } from 'gulp'
import {
    watchManifest,
    assets,
    manifest,
    watchAssets,
    environmentFile,
    watchEnvironmentFile,
    watchSrcAssets,
    srcAssets,
} from './assets'
import { dependenciesWatch, dependenciesBuild, copyHTML } from './dependencies'
import { copyESMOut, tscESModuleBuild, tscESModuleWatch, tscSystemBuild, tscSystemWatch, watchCopyESMOut } from './tsc'
import { libs } from './libraries'
// @ts-ignore
import gulpMultiProcess from 'gulp-multi-process'
import { output } from './paths'
import { named } from './helper'
import { workerBuild, workerWatch } from './build-worker'
import { isolatedBuild, isolatedWatch } from './build-isolated'
import { prebuilt_iOS } from './build-iOS'
import { buildTarget } from './env'
import { hmrServer } from './hmr'
import rimraf from 'rimraf'

function parallelProcessWatch(done: any) {
    return gulpMultiProcess(
        [
            dependenciesWatch.displayName,
            tscESModuleWatch.displayName,
            tscSystemWatch.displayName,
            workerWatch.displayName,
        ],
        done,
    )
}
named(
    'watch dependencies, esm, system, worker in 4 process',
    'Move heavy build tasks into individual process',
    parallelProcessWatch,
)

export const watch = named(
    'watch',
    'Start the development build process',
    series(
        env,
        parallel(
            watchSrcAssets,
            watchManifest,
            watchEnvironmentFile,
            watchCopyESMOut,
            watchAssets,
            isolatedWatch,
            watchCopyESMOut,
            parallelProcessWatch,
            hmrServer,
        ),
    ),
)

export async function env() {
    output.temp.ensure()
    output.extension.ensure()
    output.esmBuildOriginal.ensure()
    output.systemBuild.ensure()
    output.polyfills.ensure()
    return promisify(parallel(manifest, assets, libs))()
}
named(env.name!, 'Prepare the build process', env)

export const build = named(
    'build',
    'Build the Maskbook in production mode',
    series(
        clean,
        env,
        parallel(
            srcAssets,
            environmentFile,
            parallelProcessBuild,
            series(
                copyHTML,
                tscESModuleBuild,
                parallel(series(copyESMOut, prebuilt_iOS), function system(done: any) {
                    return buildTarget === 'firefox' ? tscSystemBuild(done) : done()
                }),
            ),
        ),
    ),
)

function parallelProcessBuild(done: any) {
    return gulpMultiProcess(
        [workerBuild.displayName, isolatedBuild.displayName, dependenciesBuild.displayName],
        done,
        true,
    )
}
export function clean(cb: any) {
    rimraf(output.extension.folder, cb)
}
named(clean.name!, 'Clean previous extension build', clean)

// export default watch
export * from './assets'
export * from './paths'
export * from './tsc'
export * from './dependencies'
export * from './build-isolated'
export * from './libraries'
export * from './build-worker'
export * from './build-iOS'
export * from './build-ci'
export * from './hmr'
export * from './web-ext-cli'
