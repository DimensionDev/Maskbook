import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginSettingsDialog } from '../../../components/InjectedComponents/PluginSettingsDialog.js'
import { attachReactTreeWithContainer } from '../../../utils/index.js'
import { rootSelector } from '../utils/selector.js'
import { startWatch } from '@masknet/theme'

/**
 * @deprecated unused
 */
export function injectPluginSettingsDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<PluginSettingsDialog />)
}
