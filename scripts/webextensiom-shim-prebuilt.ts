import fs from 'fs'
import path from 'path'
import { BUILD_PATH, ROOT_PATH, NODE_MODULES_PATH, run } from './utils'

run(ROOT_PATH, 'web-ext-prebuilts', 'eofkdgkhfoebecmamljfaepckoecjhib', 'build')

function readDir(x: string) {
    const _ = path.join(__dirname, x)
    return fs.readdirSync(_).map((x) => path.join(_, x))
}

readDir(path.resolve(BUILD_PATH, 'js'))
    .filter(function unused(x: string): boolean {
        if (x.includes('prebuilt-0-module')) return true
        if (x.includes('prebuilt') && !x.includes('content-script')) return true
        // Since content script has it prebuilt version, we can remove the original version?
        if (x.match(/content-script\.js$/)) return true
        return false
    })
    .forEach(fs.unlinkSync)
