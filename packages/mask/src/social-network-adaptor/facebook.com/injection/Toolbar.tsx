import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { ToolboxAtFacebook } from './ToolbarUI'
export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxAtFacebook />)
}
