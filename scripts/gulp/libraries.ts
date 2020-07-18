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

const systemJSLoader = parallel(
    function contentScriptSystemJSLoader() {
        return src(librariesPath.webExtensionSystemJS.js).pipe(dest(output.loaders.folder))
    },
    // function originalSystemJSLoader() {
    //     return src(librariesPath.originalSystemJS.file).pipe(rename('system.js')).pipe(dest(output.loaders.folder))
    // },
)
export function libs() {
    return promisify(parallel(ttsclib, webExtensionPolyfill, systemJSLoader))()
}
named(libs.name!, 'Copy libraries to the extension folder', libs)
