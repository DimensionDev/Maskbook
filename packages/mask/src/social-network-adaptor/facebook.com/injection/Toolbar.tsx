import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'
import { toolboxInSidebarSelector, toolboxInSidebarSelectorWithNoLeftRailStart } from '../utils/selector.js'
import { ToolboxAtFacebook } from './ToolbarUI.js'

export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const hasSpecificLeftRailStartBar = !!document.querySelector<HTMLElement>('#ssrb_left_rail_start')
    const watcher = new MutationObserverWatcher(
        hasSpecificLeftRailStartBar ? toolboxInSidebarSelector() : toolboxInSidebarSelectorWithNoLeftRailStart(),
    )
    startWatch(watcher, signal)
    const hasTopNavBar = !!document.querySelector<HTMLElement>('#ssrb_top_nav_start ~ [role="banner"]')
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxAtFacebook
            category={category}
            hasTopNavBar={hasTopNavBar}
            hasSpecificLeftRailStartBar={hasSpecificLeftRailStartBar}
        />,
    )
}
