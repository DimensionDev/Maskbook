import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { toolboxInSidebarSelector } from '../utils/selector.js'
import { ToolboxHintAtMinds } from './ToolboxHint_UI.js'

export function injectToolboxHintAtMinds(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolboxInSidebarSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxHintAtMinds category={category} />,
    )
}
