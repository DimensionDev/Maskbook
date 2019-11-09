import { LiveSelector } from '@holoflows/kit'
import { isUndefined } from 'lodash-es'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>) => {
    return new Promise<void>((resolve, reject) => {
        let timedOut = false
        setTimeout(() => (timedOut = true), 4000)
        const t = setInterval(() => {
            if (ls.evaluate()) {
                clearInterval(t)
                resolve()
            }
            if (timedOut) {
                clearInterval(t)
                reject()
            }
        }, 500)
    })
}

export const untilDocumentReady = () => {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        document.addEventListener('readystatechange', resolve, { once: true, passive: true })
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
