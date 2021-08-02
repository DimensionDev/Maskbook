import yargs, { Argv } from 'yargs'
export function getArgv<T>() {
    return (yargs(process.argv) as Argv<Partial<T>>).argv
}

export function isWatch() {
    const args = getArgv<{ watch: boolean; w: boolean }>()
    return args.watch || args.w
}
