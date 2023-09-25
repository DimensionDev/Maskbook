import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { CalendarContent } from '@masknet/plugin-calendar'

const sidebarSearchSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('[data-testid="sidebarColumn"] > div > div div div > div > div:nth-child(2)')
}

export function isExplorePage() {
    if (location.pathname === 'explore') return true
    return false
}

export function injectCalendar(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sidebarSearchSelector())
    startWatch(watcher, {
        signal,
        missingReportRule: {
            name: 'profile page cover',
            rule: () => !isExplorePage(),
        },
    })
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <CalendarContent />,
    )
}
