import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { toolboxInSidebarSelector, toolboxInSidebarSelectorWithNoLeftRailStart } from '../utils/selector.js'
import { ToolboxAtFacebook } from './ToolbarUI.js'

function hasSpecificLeftRailStartBar() {
    const ele = document
        .querySelector('[role="banner"] [role="navigation"] > ul > li:last-child a[href="/bookmarks/"]')
        ?.closest('li')
    if (!ele) return true
    const style = window.getComputedStyle(ele)
    return style.display === 'none'
}

export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(
        hasSpecificLeftRailStartBar() ? toolboxInSidebarSelector() : toolboxInSidebarSelectorWithNoLeftRailStart(),
    )
    startWatch(watcher, signal)
    const hasTopNavBar = !!document.querySelector<HTMLElement>('#ssrb_top_nav_start ~ [role="banner"]')
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxAtFacebook
            category={category}
            hasTopNavBar={hasTopNavBar}
            hasSpecificLeftRailStartBar={hasSpecificLeftRailStartBar()}
        />,
    )
}
