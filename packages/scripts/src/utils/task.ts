import type { TaskFunction } from 'gulp'
import { shell, awaitChildProcess } from './'
export function task(f: TaskFunction, name: string, description: string, flags?: TaskFunction['flags']): TaskFunction {
    f.displayName = name
    f.description = description
    f.flags = flags
    return f
}
export function watchTask(
    build: TaskFunction,
    dev: TaskFunction,
    name: string,
    description: string,
    flags?: TaskFunction['flags'],
) {
    dev.displayName = name + '-watch'
    build.displayName = name
    dev.description = build.description = description
    dev.flags = build.flags = flags
}

/** Generate Task and Task-Watch from npm scripts (`npm start` and `npm build`) */
export function fromNPMTask(baseDir: string, name: string, description: string, flags?: TaskFunction['flags']) {
    function build() {
        return awaitChildProcess(shell.cwd(baseDir)`pnpm run build`)
    }
    async function watch() {
        shell.cwd(baseDir)`pnpm run start`
    }
    watchTask(build, watch, name, description, flags)
    return [build, watch]
}
