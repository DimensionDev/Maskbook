import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Calendar } from '@masknet/plugin-calendar'

const sidebarSearchSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('[data-testid="sidebarColumn"] [role="search"]').closest(4)
}

export function injectCalendar(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sidebarSearchSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(<Calendar />)
}
