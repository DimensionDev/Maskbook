import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SearchResultBox } from '../../../components/InjectedComponents/SearchResultBox'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchTagSelector } from '../utils/selector'

export function injectPostTagAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTagSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<SearchResultBox />)
}
