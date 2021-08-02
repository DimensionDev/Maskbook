import { spawnSync } from 'child_process'
import os from 'os'
import { relative, resolve } from 'path'

const ROOT_PATH = resolve(__dirname, '..', '..')

export function run(cwd = ROOT_PATH, cmd: string, ...args: string[]) {
    console.log('$', cmd, args.join(' '), '# cwd:', relative(ROOT_PATH, cwd))
    const { status, error } = spawnSync(cmd, args, {
        cwd,
        stdio: 'inherit',
        shell: os.platform() === 'win32',
    })
    if (error) {
        console.error(error)
    }
    if (status === null || status === 0) {
        return
    }
    process.exit(status)
}
