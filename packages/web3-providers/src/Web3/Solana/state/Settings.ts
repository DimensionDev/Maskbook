import { NetworkPluginID } from '@masknet/shared-base'
import { SettingsState } from '../../Base/state/Settings.js'

export class SolanaSettings extends SettingsState {
    constructor() {
        super(NetworkPluginID.PLUGIN_SOLANA)
    }
}
