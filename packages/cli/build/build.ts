#!/usr/bin/env ts-node
import { run } from '../utils'
import onMain from './main'
import { build } from './typescript'

async function main() {
    await build()
    if (process.argv[2] === '--') {
        return run(undefined, process.argv[3], ...process.argv.slice(4))
    }
    return onMain('build')
}

main()
