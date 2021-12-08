import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResult } from '../../../components/InjectedComponents/SearchResult'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectSearchResultAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<SearchResult />)
}
