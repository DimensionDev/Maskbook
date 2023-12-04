import { SettingsState } from '../../Base/state/Settings.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class FlowSettings extends SettingsState {
    constructor() {
        super(NetworkPluginID.PLUGIN_FLOW)
    }
}
