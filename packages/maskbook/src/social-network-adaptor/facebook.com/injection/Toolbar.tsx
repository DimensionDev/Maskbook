import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { ToolboxAtFacebook } from './ToolbarUI'
export function injectToolboxHintAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLLIElement>('[data-pagelet="LeftRail"] li:nth-child(2)'),
    )
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxAtFacebook />)
}
