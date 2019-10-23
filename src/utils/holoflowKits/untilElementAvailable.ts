import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { timeout } from '../utils'

export const untilElementAvailable = async (ls: LiveSelector<HTMLElement, boolean>) => {
    await timeout(new MutationObserverWatcher(ls).startWatch({ childList: true, subtree: true }).then(), 10000)
}
