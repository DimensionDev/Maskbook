import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileSlider } from '../../../components/InjectedComponents/ProfileSlider'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchResultHeadingSelector } from '../utils/selector'

export function injectProfileSliderAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchResultHeadingSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileSlider />)
}
