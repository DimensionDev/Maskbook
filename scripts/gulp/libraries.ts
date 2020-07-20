import { src, dest, parallel } from 'gulp'
import { promisify } from 'util'
// @ts-ignore
import rename from 'gulp-rename'
import { modifyFile, named, toSystem } from './helper'
import { librariesPath, output } from './paths'

const ttsclib = parallel(
    function ttscLib() {
        return src(librariesPath.ttsclib.file).pipe(dest(output.polyfills.folder))
    },
    function ttscLibSystemFormat() {
        return src(librariesPath.ttsclib.file)
            .pipe(modifyFile(toSystem))
            .pipe(rename('ttsclib-system.js'))
            .pipe(dest(output.polyfills.folder))
    },
)
function webExtensionPolyfill() {
    return src(librariesPath.webExtensionPolyfill.file).pipe(dest(output.polyfills.folder))
}
function systemJS() {
    return src(librariesPath.systemJS.jsWithMap).pipe(dest(output.loaders.folder))
}

export function libs() {
    return promisify(parallel(ttsclib, webExtensionPolyfill, systemJS))()
}
named(libs.name!, 'Copy libraries to the extension folder', libs)
