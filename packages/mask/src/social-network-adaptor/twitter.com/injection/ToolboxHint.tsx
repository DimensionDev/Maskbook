import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { sideBarProfileSelector, toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
import { ProfileLinkAtTwitter, ToolboxHintAtTwitter } from './ToolboxHint_UI'
export function injectToolboxHintAtTwitter(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxHintAtTwitter category={category} />,
    )
    injectProfile(signal)
}

function injectProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sideBarProfileSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileLinkAtTwitter />)
}
