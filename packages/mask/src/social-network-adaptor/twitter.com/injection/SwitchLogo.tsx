import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../utils/selector.js'
import { startWatch } from '@masknet/theme'
import { attachReactTreeWithContainer } from '../../../utils/index.js'
import { SwitchLogoIconButton } from '@masknet/plugin-switch-logo'

const logoSelector: () => LiveSelector<HTMLElement, true> = () => {
    return querySelector<HTMLElement>('h1[role="heading"] a > div > svg').closest(1)
}

export function injectSwitchLogoButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(logoSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <SwitchLogoIconButton />,
    )
}
