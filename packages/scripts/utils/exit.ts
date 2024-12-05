import type { ChildProcess } from 'child_process'
import { series, type TaskFunction } from 'gulp'

const childProcess: ChildProcess[] = []
let needCleanup = false
export function cleanupWhenExit() {
    needCleanup = true
}
export function markTaskNeedCleanup(task: TaskFunction): TaskFunction {
    return (done) => {
        cleanupWhenExit()
        series(task)(done)
    }
}
process.on('exit', () => {
    if (!needCleanup) return
    for (const child of childProcess) child.kill()
})
export function markChildProcess(child: ChildProcess) {
    childProcess.push(child)
}
