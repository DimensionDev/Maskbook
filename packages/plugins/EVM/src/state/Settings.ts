import type { Plugin } from '@masknet/plugin-infra'
import { SettingsState } from '@masknet/web3-state'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
