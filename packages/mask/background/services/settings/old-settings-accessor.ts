import { head } from 'lodash-es'
import { ECKeyIdentifier, type PersonaIdentifier, type ValueRefWithReady } from '@masknet/shared-base'
import { BooleanPreference } from '@masknet/plugin-infra'
import {
    appearanceSettings,
    currentPersonaIdentifier,
    languageSettings,
    getCurrentPluginMinimalMode,
    setCurrentPluginMinimalMode,
    telemetrySettings,
    decentralizedSearchSettings,
} from '../../../shared/legacy-settings/settings.js'
import { MaskMessages } from '../../../shared/messages.js'
import { queryPersonasDB } from '../../../background/database/persona/db.js'
import { __deprecated__getStorage } from '../../utils/deprecated-storage.js'

function create<T>(settings: ValueRefWithReady<T>) {
    async function get() {
        await settings.readyPromise
        return settings.value
    }
    async function set(val: T) {
        await settings.readyPromise
        settings.value = val
    }
    return [get, set] as const
}
export const [isTelemetryEnabled, setTelemetryEnabled] = create(telemetrySettings)
export const [getTheme, setTheme] = create(appearanceSettings)
export const [getLanguage, setLanguage] = create(languageSettings)

export async function getCurrentPersonaIdentifier(): Promise<PersonaIdentifier | undefined> {
    await currentPersonaIdentifier.readyPromise
    const personas = (await queryPersonasDB({ hasPrivateKey: true }))
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : 0))
        .map((x) => x.identifier)
    const newVal = ECKeyIdentifier.from(currentPersonaIdentifier.value).unwrapOr(head(personas))
    if (!newVal) return
    if (personas.find((x) => x === newVal)) return newVal
    if (personas[0]) currentPersonaIdentifier.value = personas[0].toText()
    return personas[0]
}
export async function setCurrentPersonaIdentifier(x?: PersonaIdentifier) {
    await currentPersonaIdentifier.readyPromise
    currentPersonaIdentifier.value = x?.toText() ?? ''
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
export async function getPluginMinimalModeEnabled(id: string): Promise<BooleanPreference> {
    return getCurrentPluginMinimalMode(id)
}
export async function setPluginMinimalModeEnabled(id: string, enabled: boolean) {
    setCurrentPluginMinimalMode(id, enabled ? BooleanPreference.True : BooleanPreference.False)

    MaskMessages.events.pluginMinimalModeChanged.sendToAll([id, enabled])
}

export const [getDecentralizedSearchSettings, setDecentralizedSearchSettings] = create(decentralizedSearchSettings)

export { __deprecated__getStorage as getLegacySettingsInitialValue }
