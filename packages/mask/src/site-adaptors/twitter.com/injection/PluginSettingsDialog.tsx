import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginSettingsDialog } from '../../../components/InjectedComponents/PluginSettingsDialog.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { rootSelector } from '../utils/selector.js'

/**
 * @deprecated unused
 */
export function injectPluginSettingsDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<PluginSettingsDialog />)
}
