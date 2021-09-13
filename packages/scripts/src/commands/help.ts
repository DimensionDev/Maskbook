import { shell, task } from '../utils'
export function help() {
    return shell`npx gulp --tasks --depth=1 --sort-tasks`
}
task(help, 'default', 'Print help message')
