import { IntervalWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>, timeout = 5000) => {
    const w = new IntervalWatcher(ls)
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => reject(), timeout)
        w.useForeach(() => {
            w.stopWatch()
            resolve()
        }).startWatch(500)
    })
}
