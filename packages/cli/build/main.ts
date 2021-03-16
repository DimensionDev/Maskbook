import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { PKG_PATH } from '../utils'

const presets = ['chromium', 'E2E', 'firefox', 'android', 'iOS', 'base']
const otherFlags = ['beta', 'insider', 'reproducible', 'profile', 'manifest-v3']
const knownTargets = ['-h', '--help', ...presets, ...otherFlags]

export default async function main(mode: 'dev' | 'build') {
    let args = process.argv.slice(2)

    if (args.includes('-h') || args.includes('--help')) {
        const inquirer = require('inquirer')
        const { preset } = await inquirer.prompt({
            type: 'list',
            name: 'preset',
            message: 'Choose preset',
            choices: presets,
        })
        const { flags } = await inquirer.prompt({
            type: 'checkbox',
            name: 'flags',
            choices: otherFlags,
        })
        args = [...flags, preset]
        const { confirm } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: `Command is: "npx ${mode === 'dev' ? 'dev' : 'build'} ${args.join(' ')}". Is that OK?`,
        })
        if (!confirm) return
    }

    const command = ['--mode', mode === 'dev' ? 'development' : 'production']
    if (mode === 'dev') command.unshift('serve')
    args.filter((x) => !x.startsWith('-')).forEach((target) => {
        command.push('--env', target)
        if (!knownTargets.includes(target)) {
            throw new TypeError('Unknown target ' + target + '. Known targets: ' + knownTargets.join(','))
        }
    })
    return spawnSync('npx', ['webpack', ...command], {
        stdio: 'inherit',
        shell: true,
        cwd: resolve(PKG_PATH, 'maskbook'),
    })
}
