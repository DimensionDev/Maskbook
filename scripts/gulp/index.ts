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
import { output } from './paths'
import { multiProcess, named, parallelL, seriesL } from './helper'
import { workerBuild, workerWatch } from './build-worker'
import { isolatedBuild, isolatedWatch } from './build-isolated'
import { prebuilt_iOS } from './build-iOS'
import { buildTarget } from './env'
import { hmrServer } from './hmr'
import rimraf from 'rimraf'

function parallelProcessWatch() {
    return multiProcess([dependenciesWatch, tscESModuleWatch, tscSystemWatch, workerWatch]).run()
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

export const build = named('build', 'Build the Maskbook in production mode', function () {
    const t = seriesL(
        'Build Maskbook',
        env,
        parallelL(
            '',
            srcAssets,
            environmentFile,
            seriesL('', parallelProcessBuild, copyHTML),
            seriesL(
                'TypeScript (ESM & System JS)',
                tscESModuleBuild,
                parallelL('', seriesL('', copyESMOut, prebuilt_iOS), function system(done: any) {
                    return buildTarget === 'firefox' ? tscSystemBuild() : done()
                }),
            ),
        ),
    )
    return t.run()
})

const parallelProcessBuild = multiProcess([workerBuild, isolatedBuild, dependenciesBuild])
export function clean(cb: any) {
    rimraf(output.extension.folder, cb)
}
named(clean.name!, 'Clean previous extension build', clean)
export const cleanBuild = named('clean-build', 'Clean before build', series(clean, build))

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
export * from './cli-ui'
