import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultBox } from '../../../components/InjectedComponents/SearchResultBox.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'
import { searchResultHeadingSelector } from '../utils/selector.js'

export function injectSearchResultBoxAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<SearchResultBox />)
}
