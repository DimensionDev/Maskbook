import { execFileSync, ExecFileSyncOptions } from 'child_process'
import path from 'path'
import os from 'os'
import git from '@nice-labs/git-rev'

const cwd = path.join(__dirname, '..')
const BUILD_PATH = path.join(cwd, 'build')
const stdio = [process.stdin, process.stdout, process.stderr]
const shell = os.platform() === 'win32'

const exec = (command: string, args: string[], options?: ExecFileSyncOptions) => {
    console.log('$', command, args.join(' '), '# cwd:', options?.cwd ?? cwd)
    return execFileSync(command, args, { cwd, stdio, shell, ...options })
}

function buildTypes(name: string): string[] {
    // Always build full types
    return ['base', 'chromium', 'firefox', 'gecko', 'iOS']
}

const branch = git.branchName()
const types = buildTypes(branch.toLowerCase())
console.log(`Branch: ${branch}`)
for (const type of types) {
    console.log('#', 'Building for target:', type)
    if (type === 'chromium' && types.includes('base')) {
        // chromium doesn't have it's own changes yet.
        // just copying base version is acceptable
        exec('cp', ['-v', 'Maskbook.base.zip', 'Maskbook.chromium.zip'])
    } else {
        exec('yarn', [`build:${type.toLowerCase()}`])
        exec('zip', ['-FS', '-r', `../Maskbook.${type}.zip`, '.'], { cwd: BUILD_PATH })
        exec('rm', ['-rfv', 'build'])
    }
    exec('free', ['-h'])
}
