import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit/es'
import { SearchResultBox } from '../../../components/InjectedComponents/SearchResultBox'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectSearchResultBoxAtTwitter() {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher)

    renderInShadowRoot(<SearchResultBoxAtTwitter />, { shadow: () => watcher.firstDOMProxy.afterShadow })
}

function SearchResultBoxAtTwitter() {
    return <SearchResultBox />
}
