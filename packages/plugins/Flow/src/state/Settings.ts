import { SettingsState, Plugin } from '@masknet/plugin-infra'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
