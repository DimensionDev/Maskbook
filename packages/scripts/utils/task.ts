import { series, type TaskFunction } from 'gulp'

export function awaitTask(taskFunction: TaskFunction) {
    return new Promise<void>((resolve, reject) => {
        series(taskFunction)((err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}
