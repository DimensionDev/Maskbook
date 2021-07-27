import type { TaskFunction } from 'gulp'
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
