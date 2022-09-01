import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolboxInSideBarSelector } from '../utils/selector'
import { ToolboxHintAtMinds } from './ToolboxHint_UI'

export function injectToolboxHintAtMinds(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolboxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxHintAtMinds category={category} />,
    )
}
