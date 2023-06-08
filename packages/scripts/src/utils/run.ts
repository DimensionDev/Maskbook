import { spawn } from 'child_process'
import { ROOT_PATH } from './paths.js'
import { relative } from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { markChildProcess } from './exit.js'

function logShell(e: string, args: string[], url: URL | string) {
    if (typeof url === 'object') url = fileURLToPath(url)
    console.log(
        chalk.bold(relative(fileURLToPath(ROOT_PATH), url)),
        chalk.greenBright`$`,
        chalk.underline(`${e} ${args.join(' ')}`),
    )
}
function cwdShell(e: string, args: string[], cwd: URL | string) {
    logShell(e, args, cwd)
    const process = spawn(e, args, {
        cwd,
        stdio: 'inherit',
        shell: true,
    })
    Object.assign(process, { cwd })
    markChildProcess(process)
    return process
}
export function shell(command: TemplateStringsArray, ...rest: string[]) {
    const [e, ...args] = join(command, ...rest).split(' ')
    return cwdShell(e, args, ROOT_PATH)
}
shell.cwd = (cwd: URL | string) => {
    return (command: TemplateStringsArray | string[], ...rest: string[]) => {
        const [e, ...args] = join(command, ...rest).split(' ')
        return cwdShell(e, args, cwd)
    }
}
export function printShell(command: TemplateStringsArray, ...rest: string[]) {
    const [e, ...args] = join(command, ...rest).split(' ')
    return logShell(e, args, ROOT_PATH)
}
printShell.cwd = (cwd: URL | string) => {
    return (command: TemplateStringsArray, ...rest: string[]) => {
        const [e, ...args] = join(command, ...rest).split(' ')
        return logShell(e, args, cwd)
    }
}
function join(command: TemplateStringsArray | string[], ...rest: string[]) {
    let text = ''
    for (const [i, t] of command.entries()) {
        text += t
        i in rest && (text += rest[i])
    }
    return text
}
