#!/usr/bin/env ts-node
import fs from 'fs'
import path from 'path'
import { BUILD_PATH, run } from '../utils'

const BUILD_JS_PATH = path.join(BUILD_PATH, 'js')

run(undefined, 'web-ext-prebuilts', 'eofkdgkhfoebecmamljfaepckoecjhib', 'build')

fs.readdirSync(BUILD_JS_PATH)
    .map((_) => path.join(BUILD_JS_PATH, _))
    .filter((x) => {
        if (x.includes('prebuilt-0-module')) return true
        if (x.includes('prebuilt') && !x.includes('content-script')) return true
        // Since content script has it prebuilt version, we can remove the original version?
        if (x.match(/content-script\.js$/)) return true
        return false
    })
    .forEach(fs.unlinkSync)
