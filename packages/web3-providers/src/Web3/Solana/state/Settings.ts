import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { SettingsState } from '../../Base/state/Settings.js'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
        })
    }
}
