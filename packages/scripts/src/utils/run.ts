import { spawn } from 'child_process'
import { ROOT_PATH } from './paths'
import { relative } from 'path'
import { underline, greenBright, bold } from 'chalk'

function logShell(e: string, args: string[], cwd: string) {
    console.log(bold(relative(ROOT_PATH, cwd)), greenBright`$`, underline(`${e} ${args.join(' ')}`))
}
function cwdShell(e: string, args: string[], cwd: string) {
    logShell(e, args, cwd)
    return spawn(e, args, {
        cwd: cwd,
        stdio: 'inherit',
        shell: true,
    })
}
export function shell(command: TemplateStringsArray, ...rest: string[]) {
    const [e, ...args] = join(command, ...rest).split(' ')
    return cwdShell(e, args, ROOT_PATH)
}
shell.cwd = (path: string) => {
    return (command: TemplateStringsArray, ...rest: string[]) => {
        const [e, ...args] = join(command, ...rest).split(' ')
        return cwdShell(e, args, path)
    }
}
export function printShell(command: TemplateStringsArray, ...rest: string[]) {
    const [e, ...args] = join(command, ...rest).split(' ')
    return logShell(e, args, ROOT_PATH)
}
printShell.cwd = (path: string) => {
    return (command: TemplateStringsArray, ...rest: string[]) => {
        const [e, ...args] = join(command, ...rest).split(' ')
        return logShell(e, args, path)
    }
}
function join(command: TemplateStringsArray, ...rest: string[]) {
    let text = ''
    for (const [i, t] of command.entries()) {
        text += t
        i in rest && (text += rest[i])
    }
    return text
}
