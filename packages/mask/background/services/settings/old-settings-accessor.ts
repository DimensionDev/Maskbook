import { forIn } from 'lodash-es'
import { telemetrySettings } from '@masknet/web3-telemetry'
import {
    currentPersonaIdentifier,
    getCurrentPluginMinimalMode,
    languageSettings,
    MaskMessages,
    setCurrentPluginMinimalMode,
    type PersonaIdentifier,
    type ValueRefWithReady,
    appearanceSettings,
    BooleanPreference,
    InjectSwitchSettings,
    EnhanceableSite,
} from '@masknet/shared-base'
import { queryPersonasDB } from '../../database/persona/web.js'
import { getPluginDefine } from '@masknet/plugin-infra'
import { unreachable } from '@masknet/kit'

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
    const newVal = currentPersonaIdentifier.value || personas[0]
    if (!newVal) return
    if (personas.find((x) => x === newVal)) return newVal
    if (personas[0]) currentPersonaIdentifier.value = personas[0]
    return personas[0]
}
export async function setCurrentPersonaIdentifier(x?: PersonaIdentifier) {
    await currentPersonaIdentifier.readyPromise
    currentPersonaIdentifier.value = x
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
export async function getPluginMinimalModeEnabled(id: string): Promise<BooleanPreference> {
    return getCurrentPluginMinimalMode(id)
}
/**
 * Return a resolved result of getPluginMinimalModeEnabled.
 * If getPluginMinimalModeEnabled(id) returns BooleanPreference.Default,
 * this function will resolve it to true or false based on the plugin default.
 */
export async function getPluginMinimalModeEnabledResolved(id: string): Promise<boolean> {
    const result = getCurrentPluginMinimalMode(id)
    if (result === BooleanPreference.True) return true
    if (result === BooleanPreference.False) return false
    if (result === BooleanPreference.Default) return !!getPluginDefine(id)?.inMinimalModeByDefault
    unreachable(result)
}
export async function setPluginMinimalModeEnabled(id: string, enabled: boolean) {
    setCurrentPluginMinimalMode(id, enabled ? BooleanPreference.True : BooleanPreference.False)

    MaskMessages.events.pluginMinimalModeChanged.sendToAll([id, enabled])
}

export async function getAllInjectSwitchSettings() {
    const result = {} as Record<EnhanceableSite, boolean>
    forIn(EnhanceableSite, (value) => {
        result[value] = InjectSwitchSettings[value].value
    })
    return result
}

export async function setInjectSwitchSetting(network: string, value: boolean) {
    InjectSwitchSettings[network].value = value
}

export { __deprecated__getStorage as getLegacySettingsInitialValue } from '../../utils/deprecated-storage.js'
