import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { startWatch } from '../../../utils/watcher.js'

const logoSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('h1[role="heading"] a > div > svg')
}

export function injectLogoAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(logoSelector())
    startWatch(watcher, signal)
}
