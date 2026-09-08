import { IntervalWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'

export function untilElementAvailable(ls: LiveSelector<HTMLElement, boolean>, timeout = 5000) {
    return new Promise<void>((resolve, reject) => {
        const w = new IntervalWatcher(ls)
        // eslint-disable-next-line @eslint-react/purity
        const timer = setTimeout(() => {
            w.stopWatch()
            reject()
        }, timeout)
        w.useForeach(() => {
            w.stopWatch()
            clearTimeout(timer)
            resolve()
        }).startWatch(500)
    })
}
