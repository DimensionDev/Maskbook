import { NetworkPluginID } from '@masknet/shared-base'
import { SettingsState } from '../../Base/state/Settings.js'

export class EVMSettings extends SettingsState {
    constructor() {
        super(NetworkPluginID.PLUGIN_EVM)
    }
}
