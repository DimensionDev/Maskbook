import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { timeout } from './utils'
import { isUndefined } from 'lodash-es'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>) => {
    await timeout(new MutationObserverWatcher(ls).startWatch({ childList: true, subtree: true }).then(), 10000)
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
    return r as (HTMLElement | undefined)
}
