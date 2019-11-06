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
    return r as (HTMLElement | undefined)
}
