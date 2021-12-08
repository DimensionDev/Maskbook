import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectProfileTabAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTab />)
}
