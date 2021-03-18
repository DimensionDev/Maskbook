import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultBox } from '../../../components/InjectedComponents/SearchResultBox'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectSearchResultBoxAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    renderInShadowRoot(<SearchResultBox />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        signal,
    })
}
