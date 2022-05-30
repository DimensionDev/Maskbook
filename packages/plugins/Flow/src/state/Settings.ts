import type { Plugin } from '@masknet/plugin-infra'
import { SettingsState } from '@masknet/plugin-infra/web3'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
