import { promisify } from 'util'
import { parallel, series } from 'gulp'
import {
    watchManifest,
    assets,
    manifest,
    watchAssets,
    environmentFile,
    watchEnvironmentFile,
    watchSourceAssets,
    sourceAssets,
} from './assets'
import { dependenciesWatch, dependenciesBuild } from './dependencies'
import { copyESMOut, tscESModuleBuild, tscESModuleWatch, tscSystemBuild, tscSystemWatch, watchCopyESMOut } from './tsc'
import { libs } from './libraries'
// @ts-ignore
import gulpMultiProcess from 'gulp-multi-process'
import { output } from './paths'
import { named } from './helper'
import { workerBuild, workerWatch } from './build-worker'
import { isolatedBuild, isolatedWatch } from './build-isolated'

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
            watchManifest,
            watchEnvironmentFile,
            watchAssets,
            isolatedWatch,
            watchCopyESMOut,
            watchSourceAssets,
            parallelProcessWatch,
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
            sourceAssets,
            environmentFile,
            workerBuild,
            isolatedBuild,
            dependenciesBuild,
            series(tscESModuleBuild, parallel(copyESMOut, tscSystemBuild)),
        ),
    ),
)
export function clean(cb: any) {
    require('rimraf')(output.extension.folder, cb)
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
