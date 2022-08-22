import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultTabs } from '../../../components/InjectedComponents/SearchResultTabs'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectSearchResultTabsAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<SearchResultTabs />)
}
