import yargs, { Argv } from 'yargs'
const { hideBin } = require('yargs/helpers')

export function parseArgs<T>() {
    return (yargs(hideBin(process.argv)) as Argv<Partial<T>>).argv
}
