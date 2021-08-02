export function pollingTask(
    task: () => Promise<boolean>,
    {
        autoStart = true,
        delay = 30 * 1000,
    }: {
        autoStart?: boolean
        delay?: number
    } = {},
) {
    let canceled = !autoStart
    let timer: NodeJS.Timeout

    const runTask = async () => {
        if (canceled) return
        let stop = false
        try {
            stop = await task()
        } catch (e: unknown) {
            console.error(e)
        }
        if (!stop) resetTask()
    }
    const resetTask = () => {
        canceled = false
        clearTimeout(timer)
        timer = setTimeout(runTask, delay)
    }
    const cancelTask = () => {
        canceled = true
    }

    if (!canceled) runTask()
    return {
        reset: resetTask,
        cancel: cancelTask,
    }
}
