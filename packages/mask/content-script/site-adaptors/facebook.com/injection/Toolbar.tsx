import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import {
    toolboxInSidebarSelector,
    toolboxInSidebarSelectorWithNoLeftRailStart,
    toolboxInSpecialSidebarSelector,
} from '../utils/selector.js'
import { ToolboxAtFacebook } from './ToolbarUI.js'

function hasSpecificLeftRailStartBar() {
    const ele = document
        .querySelector('[role="banner"] [role="navigation"] > ul > li:last-child a[href="/bookmarks/"]')
        ?.closest('li')
    if (!ele) return true
    const style = window.getComputedStyle(ele)
    return style.display === 'none'
}

function isNormalLeftRailStartBar() {
    // cspell:disable-next-line
    return !!document.querySelector('[data-pagelet="LeftRail"]')
}

export function injectToolboxHintAtFacebook(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(
        isNormalLeftRailStartBar() ? toolboxInSidebarSelector() : toolboxInSpecialSidebarSelector(),
    )
    startWatch(watcher, signal)
    // cspell:disable-next-line
    const hasTopNavBar = !!document.querySelector<HTMLElement>('#ssrb_top_nav_start ~ [role="banner"]')
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxAtFacebook
            category={category}
            hasTopNavBar={hasTopNavBar}
            hasSpecificLeftRailStartBar={hasSpecificLeftRailStartBar()}
        />,
    )

    const watcherNoLeftRailStart = new MutationObserverWatcher(toolboxInSidebarSelectorWithNoLeftRailStart())
    startWatch(watcherNoLeftRailStart, signal)
    attachReactTreeWithContainer(watcherNoLeftRailStart.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxAtFacebook
            category={category}
            hasTopNavBar={hasTopNavBar}
            hasSpecificLeftRailStartBar={hasSpecificLeftRailStartBar()}
        />,
    )
}
