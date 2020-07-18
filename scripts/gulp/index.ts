import { promisify } from 'util'
import { parallel, series } from 'gulp'
import { watchManifest, assets, manifest, watchAssets } from './assets'
import { dependenciesWatch, dependenciesBuild } from './dependencies'
import { tscESModuleBuild, tscESModuleWatch, tscSystemBuild, tscSystemWatch } from './tsc'
import { libs } from './libraries'
import { workerBuild, workerWatch } from './build-isolated'
// @ts-ignore
import gulpMultiProcess from 'gulp-multi-process'
import { output } from './paths'
import { named } from './helper'

function parallelProcessWatch(done: any) {
    return gulpMultiProcess(
        [dependenciesWatch.displayName, tscESModuleWatch.name, tscSystemWatch.name, workerWatch.displayName],
        done,
    )
}
named(
    'watch dependencies, esm, system, worker in 4 process',
    parallelProcessWatch,
    'Move heavy build tasks into individual process',
)

export const watch = series(
    preclude,
    //
    parallel(watchManifest, watchAssets, parallelProcessWatch),
)
named('watch', watch, 'Start the development build process')

export async function preclude() {
    output.temp.ensure()
    output.extension.ensure()
    output.esmBuild.ensure()
    output.systemBuild.ensure()
    output.dependencies.ensure()
    output.polyfills.ensure()
    return promisify(parallel(manifest, assets, libs))()
}
named(preclude.name!, preclude, 'Prepare the build process')

export const build = series(
    clean,
    preclude,
    parallel(
        //
        workerBuild,
        series(
            tscESModuleBuild,
            //
            parallel(tscSystemBuild, dependenciesBuild),
        ),
    ),
)
named('build', build, 'Build the Maskbook in production mode')
export function clean(cb: any) {
    require('rimraf')(output.extension.folder, cb)
}
named(clean.name!, clean, 'Clean previous extension build')

// export default watch
export * from './assets'
export * from './paths'
export * from './tsc'
export * from './dependencies'
export * from './build-isolated'
export * from './libraries'
