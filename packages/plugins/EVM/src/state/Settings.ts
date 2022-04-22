import type { Plugin } from '@masknet/plugin-infra'
import { SettingsState, Web3Plugin } from '@masknet/plugin-infra/web3'

export class Settings extends SettingsState implements Web3Plugin.ObjectCapabilities.SettingsState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
