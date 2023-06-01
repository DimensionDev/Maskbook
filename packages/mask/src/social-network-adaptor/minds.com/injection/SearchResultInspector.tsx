import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultInspector } from '../../../components/InjectedComponents/SearchResultInspector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'
import { searchResultHeadingSelector } from '../utils/selector.js'

export function injectSearchResultInspectorAtMinds(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { signal }).render(<SearchResultInspector />)
}
