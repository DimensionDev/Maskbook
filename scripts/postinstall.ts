import { execFileSync } from 'child_process'
import path from 'path'
import os from 'os'

const cwd = path.join(__dirname, '..', 'node_modules', '@holoflows', 'kit')
const stdio = [process.stdin, process.stdout, process.stderr]
const shell = os.platform() === 'win32'
const yarn = (...args: string[]) => execFileSync('yarn', args, { cwd, stdio, shell })

yarn('install')
yarn('build:tsc')
yarn('build:rollup')
