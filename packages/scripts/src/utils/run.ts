import { spawn } from 'child_process'
import { ROOT_PATH } from '.'

function cwdShell(e: string, args: string[], cwd: string) {
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
function join(command: TemplateStringsArray, ...rest: string[]) {
    let text = ''
    for (const [i, t] of command.entries()) {
        text += t
        i in rest && (text += rest[i])
    }
    return text
}
