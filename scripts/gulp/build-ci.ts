import { src, dest, series, TaskFunction } from 'gulp'
import zip from 'gulp-zip'
import { promisify } from 'util'
import { build } from '.'
import { environmentFile, manifest } from './assets'
import { prebuilt_iOS } from './build-iOS'
import { setEnv } from './env'
import { output, root } from './paths'
import { tscSystemBuild } from './tsc'

// TODO: webpack build should not use these variables as build time env so we can speed up build
export async function ci() {
    // build base
    await run(build)
    // build chrome
    await run(pack('Maskbook.chromium.zip'))

    // build android
    setEnv({ target: 'firefox', arch: 'app', fx: 'geckoview', resolution: 'mobile', repro: true })
    await run(manifest)
    await run(environmentFile)
    await run(tscSystemBuild)
    await run(pack('Maskbook.gecko.zip'))

    // build firefox
    setEnv({ arch: 'web', fx: 'fennec', resolution: 'desktop', repro: false })
    await run(manifest)
    await run(environmentFile)
    await run(pack('Maskbook.firefox.zip'))

    // build ios
    setEnv({ arch: 'app', resolution: 'mobile', target: 'safari' })
    await run(manifest)
    await run(environmentFile)
    await promisify(require('rimraf'))(output.systemBuild.folder)
    await run(prebuilt_iOS)
    await run(pack('Maskbook.iOS.zip'))
}

function pack(file: string) {
    console.log('Packing', file)
    return src(output.extension.files, { buffer: true }).pipe(zip(file)).pipe(dest(root.folder))
}

function run(x: TaskFunction | NodeJS.WritableStream | Promise<any>): Promise<unknown> {
    if (typeof x === 'function') {
        return run(promisify(series(x))())
    }
    if (x instanceof Promise) return x
    return new Promise((resolve, reject) => {
        x.on('end', resolve)
        x.on('error', reject)
    })
}
