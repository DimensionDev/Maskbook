import type { Plugin } from '@masknet/plugin-infra'
import { SettingsState } from '../../Base/state/Settings.js'

export class Settings extends SettingsState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context)
    }
}
