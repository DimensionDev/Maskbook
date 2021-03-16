#!/usr/bin/env ts-node
import { run } from '../utils'
import onMain from './main'
import { build, dev } from './typescript'

async function main() {
    await build().catch(console.error)
    dev()
    if (process.argv[2] === '--') {
        return run(undefined, process.argv[3], ...process.argv.slice(4))
    }
    return onMain('dev')
}

main()
