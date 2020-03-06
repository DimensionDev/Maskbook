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
