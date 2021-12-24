// @ts-check
import { spawn } from 'child_process'
import { readFile, writeFile, unlink, rmdir } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __file = fileURLToPath(import.meta.url)
const __dirname = resolve(__file, '../')

function awaitChildProcess(child) {
  return new Promise((resolve, reject) => {
    child.on('error', () => reject(child.exitCode || 0))
    child.on('exit', (code) => resolve(code || 0))
  })
}

const rollup = awaitChildProcess(
  spawn('pnpm run build:rollup', {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit',
  }),
)
await rollup
const version = JSON.parse(await readFile(join(__dirname, './package.json'), 'utf-8')).version
const now = new Date()
const packageJSON = {
  name: '@dimensiondev/provider-proxy',
  version: `${version}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2)}${String(now.getDate()).padStart(
    2,
  )}-${String(now.getHours()).padStart(2)}${String(now.getMinutes()).padStart(2)}`.replace(' ', '0'),
  dependencies: {
    // 'wallet.ts': '1.0.1',
    'bignumber.js': '9.0.1',
    'socket.io-client': '2.4.0',
    'lodash-unified': '1.0.1',
  },
  main: './output.js',
  types: './output.d.ts',
  files: ['output.js', 'output.d.ts'],
}
await writeFile(join(__dirname, './dist/package.json'), JSON.stringify(packageJSON, undefined, 4))

const out = join(__dirname, './dist')
// validate if there is dependency missing
await awaitChildProcess(
  spawn('npm install', {
    cwd: out,
    shell: true,
    stdio: 'inherit',
  }),
)
await awaitChildProcess(
  spawn('node output.js', {
    cwd: out,
    shell: true,
    stdio: 'inherit',
  }),
)
