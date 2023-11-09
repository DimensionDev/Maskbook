import type { WalletAPI } from '../../../entry-types.js'
import { SettingsState } from '../../Base/state/Settings.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class FlowSettings extends SettingsState {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
        })
    }
}
