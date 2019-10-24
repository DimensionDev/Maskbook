import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { timeout } from './utils'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>) => {
    await timeout(new MutationObserverWatcher(ls).startWatch({ childList: true, subtree: true }).then(), 10000)
}

export function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        document.addEventListener('readystatechange', resolve, { once: true, passive: true })
    })
}
