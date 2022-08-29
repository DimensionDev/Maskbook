import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginSettingDialog } from '../../../components/InjectedComponents/PluginSettingDialog'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { rootSelector } from '../utils/selector'

export function inbjectPluginSettingDialogAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(rootSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<PluginSettingDialog />)
}
