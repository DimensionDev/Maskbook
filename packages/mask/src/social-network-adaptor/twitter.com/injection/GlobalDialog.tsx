import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { GlobalDialog } from '@masknet/shared'
import { createReactRootShadowed, startWatch } from '../../../utils/index.js'
import { rootSelector } from '../utils/selector.js'

export function injectGlobalDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<GlobalDialog />)
}
