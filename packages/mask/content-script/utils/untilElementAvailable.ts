import { IntervalWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'

export function untilElementAvailable(ls: LiveSelector<HTMLElement, boolean>, timeout = 5000) {
    return new Promise<void>((resolve, reject) => {
        const w = new IntervalWatcher(ls)
        setTimeout(() => reject(), timeout)
        w.useForeach(() => {
            w.stopWatch()
            resolve()
        }).startWatch(500)
    })
}
