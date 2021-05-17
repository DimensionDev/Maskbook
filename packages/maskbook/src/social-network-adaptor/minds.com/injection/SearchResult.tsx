import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultBox } from '../../../components/InjectedComponents/SearchResultBox'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectSearchResultBoxAtMinds(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<SearchResultBox />)
}
