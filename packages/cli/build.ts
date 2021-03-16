#!/usr/bin/env ts-node
import { spawnSync } from 'child_process'
import onMain from './main'
import { build } from './typescript'

async function main() {
    await build()
    if (process.argv[2] === '--') {
        spawnSync(process.argv.slice(3).join(' '), { shell: true, stdio: 'inherit' })
    } else {
        onMain('build')
    }
}

main()
