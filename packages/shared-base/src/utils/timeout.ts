/**
 * Accept a promise and then set a timeout on it. After `time` ms, it will reject.
 * @param promise - The promise that you want to set time limit on.
 * @param time - Time before timeout. In `ms`.
 * @param rejectReason - When reject, show a reason. Defaults to `"timeout"`
 */
export function timeout<T>(promise: PromiseLike<T>, time: number, rejectReason?: string): Promise<T> {
    if (!Number.isFinite(time)) return (async () => promise)()
    let timer: any
    const race = Promise.race([
        promise,
        new Promise<T>((r, reject) => {
            timer = setTimeout(() => reject(new Error(rejectReason ?? 'timeout')), time)
        }),
    ])
    race.finally(() => clearTimeout(timer))
    return race
}
