import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { ToolboxHintAtMinds } from './ToolboxHint_UI'

export function injectToolboxHintAtMinds(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtMinds />)
}
