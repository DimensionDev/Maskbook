import type { Plugin } from '@masknet/plugin-infra'
import { SettingsState } from '../../Base/state/Settings.js'
import { NetworkPluginID } from '@masknet/shared-base'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_FLOW,
        })
    }
}
