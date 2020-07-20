import { execFileSync } from 'child_process'
import os from 'os'
import path from 'path'

export const ROOT_PATH = path.resolve(__dirname, '..')
export const NODE_MODULES_PATH = path.resolve(ROOT_PATH, 'node_modules')
export const BUILD_PATH = path.resolve(ROOT_PATH, 'build')

export function run(cwd: string | undefined, cmd: string, ...args: string[]) {
    console.log('$', cmd, args.join(' '), '# cwd:', cwd)
    return execFileSync(cmd, args, {
        cwd,
        stdio: [process.stdin, process.stdout, process.stderr],
        shell: os.platform() === 'win32',
    })
}
