import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { EnhancedProfileaPage } from '../../../components/InjectedComponents/EnhancedProfile'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { searchProfileEmptySelector, searchProfileTabPageSelector } from '../utils/selector'

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}
export function injectEnhancedProfileAtTwitter(signal: AbortSignal) {
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
}
