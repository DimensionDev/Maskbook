import { task } from '../utils/index.js'
import Gulp from 'gulp'
// @ts-ignore internal apis
import logTasks from 'gulp-cli/lib/shared/log/tasks.js'
// @ts-ignore
import getTask from 'gulp-cli/lib/versioned/^4.0.0/log/get-task.js'

export async function help() {
    const nodes = Gulp.tree({ deep: true })
    return logTasks(nodes, { sortTasks: true, tasksDepth: 1 }, getTask(Gulp))
}
task(help, 'default', 'Print help message')
