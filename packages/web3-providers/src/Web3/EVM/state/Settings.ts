import type { WalletAPI } from '../../../entry-types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { SettingsState } from '../../Base/state/Settings.js'

export class EVMSettings extends SettingsState {
    constructor(context: WalletAPI.IOContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
        })
    }
}
