// @ts-check
// Build step:
// 1. run rollup
// 2. fix .d.ts file
// 3. add a package.json
// 4. run npm pack

import { spawn, exec } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __file = fileURLToPath(import.meta.url)
const __dirname = resolve(__file, '../')
const __root = join(__dirname, './dist')

function execute(command) {
    return new Promise((resolve) => {
        exec(command, function (error, stdout, stderr) {
            resolve(stdout)
        })
    })
}
function awaitChildProcess(child) {
    return new Promise((resolve, reject) => {
        child.on('error', () => reject(child.exitCode || 0))
        child.on('exit', (code) => resolve(code || 0))
    })
}

const commitDate = await execute(`git show -s --format=%cd --date=format:'%Y%m%d' HEAD`)
const commit = await execute(`git rev-parse HEAD`)
const version = `0.0.0-${commitDate}-${commit}`.replaceAll('\n', '').replaceAll("'", '')

const rollup = await awaitChildProcess(
    spawn(`pnpm run build:rollup`, {
        cwd: __dirname,
        shell: true,
        stdio: 'inherit',
    }),
)
await rollup

const packageJSON = {
    name: '@masknet/encryption-sdk',
    repository: 'https://github.com/DimensionDev/Maskbook',
    version: version,
    dependencies: {
        '@msgpack/msgpack': '^2.7.2',
        pvtsutils: '^1.3.2',
        anchorme: '^2.1.2',
    },
    type: 'module',
    main: './index.js',
    types: './index.d.ts',
    files: ['index.js', 'index.d.ts'],
}
await writeFile(join(__root, 'package.json'), JSON.stringify(packageJSON, undefined, 4))

{
    const dts = join(__root, 'index.d.ts')
    const data = (await readFile(dts, 'utf-8'))
        .replace(`import { TypedMessage as TypedMessage$1 } from '@masknet/typed-message';`, '')
        .replaceAll('TypedMessage$1', '')
    writeFile(dts, data)
}

// validate if there is dependency missing
await awaitChildProcess(
    spawn('npm install', {
        cwd: __root,
        shell: true,
        stdio: 'inherit',
    }),
)
const mod = await import('./dist/index.js')
console.log('Build success with exports:', ...Object.keys(mod))
