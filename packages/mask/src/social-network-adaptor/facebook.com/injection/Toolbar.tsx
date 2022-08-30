import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolBoxInSideBarSelector, toolBoxInSideBarSelectorWithNoLeftRailStart } from '../utils/selector'
import { ToolboxAtFacebook } from './ToolbarUI'

export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const hasSpecificLeftRailStartBar = Boolean(document.querySelector<HTMLElement>('#ssrb_left_rail_start'))
    const watcher = new MutationObserverWatcher(
        hasSpecificLeftRailStartBar ? toolBoxInSideBarSelector() : toolBoxInSideBarSelectorWithNoLeftRailStart(),
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
