import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginSettingsDialog } from '../../../components/InjectedComponents/PluginSettingsDialog'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { rootSelector } from '../utils/selector'

export function injectPluginSettingsDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<PluginSettingsDialog />)
}
