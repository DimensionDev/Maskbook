import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { EnhancedProfileTab } from '../../../components/InjectedComponents/EnhancedProfileTab'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { searchProfileTabListLastChildSelector } from '../utils/selector'

export function injectEnhancedProfileTabAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileTab />)
}
