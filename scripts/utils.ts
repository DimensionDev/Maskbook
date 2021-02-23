import { spawnSync } from 'child_process'
import os from 'os'
import path from 'path'

export const ROOT_PATH = path.resolve(__dirname, '..')
export const BUILD_PATH = path.resolve(ROOT_PATH, 'build')

export function run(cwd = ROOT_PATH, cmd: string, ...args: string[]) {
    console.log('$', cmd, args.join(' '), '# cwd:', path.relative(ROOT_PATH, cwd))
    return spawnSync(cmd, args, {
        cwd,
        stdio: 'inherit',
        shell: os.platform() === 'win32',
    })
}
