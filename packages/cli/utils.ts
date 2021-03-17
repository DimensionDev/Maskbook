import { ChildProcess, spawnSync } from 'child_process'
import os from 'os'
import { relative, resolve } from 'path'

export const ROOT_PATH = resolve(__dirname, '..', '..')
export const PKG_PATH = resolve(ROOT_PATH, 'packages')
export const BUILD_PATH = resolve(ROOT_PATH, 'build')
export const NETLIFY_PATH = resolve(PKG_PATH, 'netlify')

export function run(cwd = ROOT_PATH, cmd: string, ...args: string[]) {
    console.log('$', cmd, args.join(' '), '# cwd:', relative(ROOT_PATH, cwd))
    return spawnSync(cmd, args, {
        cwd,
        stdio: 'inherit',
        shell: os.platform() === 'win32',
    })
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const awaitChildProcess = (child: ChildProcess) => {
    return new Promise<number>((resolve) => {
        child.on('error', () => resolve(child.exitCode))
        child.on('exit', (code) => resolve(code))
    })
}
