import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginSettingsDialog } from '../../../components/InjectedComponents/PluginSettingsDialog.js'
import { attachReactTreeWithContainer, startWatch } from '../../../utils/index.js'
import { rootSelector } from '../utils/selector.js'

/**
 * @deprecated unused
 */
export function injectPluginSettingsDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<PluginSettingsDialog />)
}
