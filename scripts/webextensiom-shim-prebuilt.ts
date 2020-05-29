import { execFileSync } from 'child_process'
import path from 'path'
import os from 'os'

const stdio = [process.stdin, process.stdout, process.stderr]
const shell = os.platform() === 'win32'
const run = (cwd: string, cmd: string, ...args: string[]) => execFileSync(cmd, args, { cwd, stdio, shell })

run(
    path.join(__dirname, '../node_modules/webextension-shim'),
    'node',
    ...'../ts-node/dist/bin.js -T ./src/bin/prebuilts.ts eofkdgkhfoebecmamljfaepckoecjhib ../../build/'.split(' '),
)
import fs from 'fs'
function readDir(x: string) {
    const _ = path.join(__dirname, x)
    return fs.readdirSync(_).map((x) => path.join(_, x))
}
readDir('../build/js').filter(unused).forEach(fs.unlinkSync)
// .forEach((x) => console.log(x))
function unused(x: string): boolean {
    if (x.includes('prebuilt-0-module')) return true
    if (x.includes('prebuilt') && !x.includes('content-script')) return true
    // Since content script has it prebuilt version, we can remove the original version?
    if (x.match(/content-script\.js$/)) return true
    return false
}
