import { IntervalWatcher, LiveSelector } from '@holoflows/kit'
import { isUndefined } from 'lodash-es'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>) => {
    const w = new IntervalWatcher(ls)
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => reject(), 5000)
        w.useForeach(() => {
            w.stopWatch()
            resolve()
        }).startWatch(500)
    })
}

export function untilDomLoaded() {
    if (document.readyState !== 'loading') return Promise.resolve()
    return new Promise(resolve => {
        const callback = () => {
            if (document.readyState !== 'loading') {
                resolve()
                document.removeEventListener('readystatechange', callback)
            }
        }
        document.addEventListener('readystatechange', callback, { passive: true })
    })
}

export function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        const callback = () => {
            if (document.readyState === 'complete') {
                resolve()
                document.removeEventListener('readystatechange', callback)
            }
        }
        document.addEventListener('readystatechange', callback, { passive: true })
    })
}

export const nthChild = (n: HTMLElement, ...childrenIndex: number[]) => {
    let r = n
    for (const v of childrenIndex) {
        if (isUndefined(r)) break
        r = r.children[v] as HTMLElement
    }
    return r as HTMLElement | undefined
}
