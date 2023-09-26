import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { CalendarContent } from '@masknet/plugin-calendar'

const sidebarSearchSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('div .css-1dbjc4n.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x')
}

export function injectCalendar(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sidebarSearchSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <CalendarContent />,
    )
}
