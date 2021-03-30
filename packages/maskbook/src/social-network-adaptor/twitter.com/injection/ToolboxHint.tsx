import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { ToolboxHint } from '../../../components/InjectedComponents/ToolboxHint'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'

export function injectToolboxHintAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtTwitter />)
}

function ToolboxHintAtTwitter() {
    // Todo: add click handler
    return <ToolboxHint />
}
