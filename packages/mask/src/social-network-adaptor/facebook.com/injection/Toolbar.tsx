import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolboxInSidebarSelector, toolboxInSidebarSelectorWithNoLeftRailStart } from '../utils/selector'
import { ToolboxAtFacebook } from './ToolbarUI'

export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const hasSpecificLeftRailStartBar = Boolean(document.querySelector<HTMLElement>('#ssrb_left_rail_start'))
    const watcher = new MutationObserverWatcher(
        hasSpecificLeftRailStartBar ? toolboxInSidebarSelector() : toolboxInSidebarSelectorWithNoLeftRailStart(),
    )
    startWatch(watcher, signal)
    const hasTopNavBar = Boolean(document.querySelector<HTMLElement>('#ssrb_top_nav_start ~ [role="banner"]'))
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxAtFacebook
            category={category}
            hasTopNavBar={hasTopNavBar}
            hasSpecificLeftRailStartBar={hasSpecificLeftRailStartBar}
        />,
    )
}
