import yargs, { Argv } from 'yargs'
const { hideBin } = require('yargs/helpers')
export function getArgv<T>() {
    return (yargs(hideBin(process.argv)) as Argv<Partial<T>>).argv
}

export function isWatch() {
    const args = getArgv<{ watch: boolean; w: boolean }>()
    return args.watch || args.w
}
