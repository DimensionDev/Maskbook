import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Calendar } from '@masknet/plugin-calendar'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { querySelector } from '../utils/selector.js'

function sidebarSearchSelector() {
    return querySelector<HTMLElement>(
        '[data-testid="sidebarColumn"] > div > div > div > div[tabindex="0"] > div > div:not(div[tabindex="0"]):empty',
    )
}

function sidebarExplorePageSelector() {
    return querySelector<HTMLElement>('[data-testid="settingsAppBar"]')
        .closest(12)
        .querySelector('[data-testid="sidebarColumn"] [tabindex="0"] > div')
}

function sidebarSearchPageSelector() {
    return querySelector<HTMLElement>('[data-testid="searchBoxOverflowButton"]')
        .closest(11)
        .querySelector('[data-testid="sidebarColumn"] [tabindex="0"] > div > div')
}
export function injectCalendar(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sidebarSearchSelector())
    const exploreWatcher = new MutationObserverWatcher(sidebarExplorePageSelector())
    const searchWatcher = new MutationObserverWatcher(sidebarSearchPageSelector())
    startWatch(watcher, signal)
    startWatch(exploreWatcher, signal)
    startWatch(searchWatcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(<Calendar />)
    attachReactTreeWithContainer(exploreWatcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <Calendar target="/explore" />,
    )
    attachReactTreeWithContainer(searchWatcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <Calendar target="/search" />,
    )
}
