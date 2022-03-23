// @ts-check
import { spawn } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { format as formatDate } from 'date-fns'

const __file = fileURLToPath(import.meta.url)
const __dirname = resolve(__file, '../')
const __root = join(__dirname, './dist')

function awaitChildProcess(child) {
    return new Promise((resolve, reject) => {
        child.on('error', () => reject(child.exitCode || 0))
        child.on('exit', (code) => resolve(code || 0))
    })
}

const version = JSON.parse(await readFile(join(__dirname, 'package.json'), 'utf-8')).version
const buildVersion = process.env.BUILD_VERSION ?? formatDate(Date.now(), 'yyyymmddHHMMss')
const fullVersion = `${version}-${buildVersion}`

const rollup = awaitChildProcess(
    spawn(`PROXY_VERSION=${fullVersion} pnpm run build:rollup`, {
        cwd: __dirname,
        shell: true,
        stdio: 'inherit',
    }),
)
await rollup
const packageJSON = {
    name: '@dimensiondev/provider-proxy',
    repository: 'https://github.com/DimensionDev/Maskbook',
    version: fullVersion,
    dependencies: {
        // 'wallet.ts': '1.0.1',
        'bignumber.js': '9.0.1',
        'socket.io-client': '2.4.0',
        'lodash-unified': '1.0.1',
        'date-fns': '2.27.0',
        urlcat: '^2.0.4',
    },
    main: './output.js',
    types: './output.d.ts',
    files: ['output.js', 'output.d.ts'],
}
await writeFile(join(__root, 'package.json'), JSON.stringify(packageJSON, undefined, 4))

// validate if there is dependency missing
await awaitChildProcess(
    spawn('npm install', {
        cwd: __root,
        shell: true,
        stdio: 'inherit',
    }),
)
await awaitChildProcess(
    spawn('node output.js', {
        cwd: __root,
        shell: true,
        stdio: 'inherit',
    }),
)
