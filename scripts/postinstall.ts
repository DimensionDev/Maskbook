import { execFileSync } from 'child_process'
import path from 'path'
import os from 'os'

const stdio = [process.stdin, process.stdout, process.stderr]
const cwd = path.join(__dirname, '..', 'node_modules', '@holoflows', 'kit')
const yarn = (...args: string[]) => execFileSync('yarn', args, { cwd, stdio, shell: os.platform() == 'win32' })

yarn('install')
yarn('build:tsc')
yarn('build:rollup')
