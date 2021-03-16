// start a one-time "tsc -b" or parallel "tsc -b -w"
import { runCli } from '@magic-works/i18n-codegen'
import { spawn, spawnSync, SpawnSyncOptions } from 'child_process'
import { resolve } from 'path'
import makeLockSequence from './process-lock'
import { ROOT_PATH } from './utils'

const config = resolve(ROOT_PATH, '.i18n-codegen.json')
const options: SpawnSyncOptions = {
    cwd: ROOT_PATH,
    stdio: 'inherit',
    shell: true,
}

export async function dev() {
    lock: for await (const lock of makeLockSequence()) {
        if (await lock()) break lock
    }
    runCli({ config, watch: true }, console.error)
    spawnSync('npx', ['tsc', '-b', '-w'], options)
}
dev.displayName = 'ts'
dev.description = 'Start to watch TypeScript project reference'

export const build = () => {
    return new Promise((resolve, reject) => {
        runCli({ config }, console.error)
        const process = spawn('npx', ['tsc', '-b'], options)
        process.on('close', resolve)
        process.on('error', reject)
    })
}
build.displayName = 'build-ts'
build.description = 'Build TypeScript project reference'
