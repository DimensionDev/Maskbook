import { SwitchLogoButton } from '@masknet/plugin-switch-logo'
import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'

const logoSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('h1[role="heading"] a > div > svg').closest(1)
}

export function injectSwitchLogoButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(logoSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <SwitchLogoButton />,
    )
}
