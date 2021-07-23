import { spawnSync } from 'child_process'
import os from 'os'
import { relative } from 'path'
import { ROOT_PATH } from './paths'

export function run(cwd = ROOT_PATH, cmd: string, ...args: string[]) {
    console.log('$', cmd, args.join(' '), '# cwd:', relative(ROOT_PATH, cwd))
    return spawnSync(cmd, args, {
        cwd,
        stdio: 'inherit',
        shell: os.platform() === 'win32',
    })
}
