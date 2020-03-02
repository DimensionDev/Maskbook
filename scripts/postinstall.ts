import { execFileSync } from "child_process"
import path from "path"

const stdio = [process.stdin, process.stdout, process.stderr]
const cwd = path.join(__dirname, '..', 'node_modules', '@holoflows', 'kit')
const yarn = (...args: string[]) => execFileSync("yarn", args, { cwd, stdio })

yarn('install')
yarn('build:tsc')
yarn('build:rollup')
