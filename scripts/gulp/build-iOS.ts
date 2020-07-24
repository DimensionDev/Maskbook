import { dest, src, series } from 'gulp'
import { buildArchitecture, buildTarget } from './env'
import { output } from './paths'
import { gulpPrebuilt } from '@dimensiondev/webextension-shim/dist/bin/prebuilt-lib'
import { named } from './helper'
import rimraf from 'rimraf'
import { promisify } from 'util'
export function prebuilt_iOS(done: any) {
    if (buildArchitecture !== 'app' || buildTarget !== 'safari') return done()
    const [build, rename] = gulpPrebuilt('module')
    return series(
        function built() {
            return src(output.esmBuildClone.js).pipe(build).pipe(rename).pipe(dest(output.esmBuildClone.folder))
        },
        function remove() {
            return promisify(rimraf)(output.esmBuildClone.js)
        },
    )(done)
}
named('prebuilt-ios', 'Build files for iOS', prebuilt_iOS)
