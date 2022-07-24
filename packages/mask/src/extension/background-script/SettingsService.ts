import { ECKeyIdentifier, PersonaIdentifier } from '@masknet/shared-base'
import { head } from 'lodash-unified'
import type { InternalSettings } from '../../../shared/legacy-settings/createSettings'
import {
    appearanceSettings,
    currentPersonaIdentifier,
    languageSettings,
    currentPluginMinimalModeNOTEnabled,
    pluginIDSettings,
} from '../../../shared/legacy-settings/settings'
import { MaskMessages } from '../../../shared'
import { queryPersonasDB } from '../../../background/database/persona/db'

export * from '../../../background/services/settings'

function create<T>(settings: InternalSettings<T>) {
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
export const [getPluginID, setPluginID] = create(pluginIDSettings)
export const [getTheme, setTheme] = create(appearanceSettings)
export const [getLanguage, setLanguage] = create(languageSettings)

export async function getCurrentPersonaIdentifier(): Promise<PersonaIdentifier | undefined> {
    await currentPersonaIdentifier.readyPromise
    const personas = (await queryPersonasDB({ hasPrivateKey: true }))
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : 0))
        .map((x) => x.identifier)
    const newVal = ECKeyIdentifier.from(currentPersonaIdentifier.value).unwrapOr(head(personas))
    if (!newVal) return undefined
    if (personas.find((x) => x === newVal)) return newVal
    if (personas[0]) currentPersonaIdentifier.value = personas[0].toText()
    return personas[0]
}
export async function setCurrentPersonaIdentifier(x: PersonaIdentifier) {
    await currentPersonaIdentifier.readyPromise
    currentPersonaIdentifier.value = x.toText()
}
export async function getPluginMinimalModeEnabled(id: string) {
    return !currentPluginMinimalModeNOTEnabled['plugin:' + id].value
}
export async function setPluginMinimalModeEnabled(id: string, enabled: boolean) {
    currentPluginMinimalModeNOTEnabled['plugin:' + id].value = !enabled

    MaskMessages.events.pluginMinimalModeChanged.sendToAll([id, enabled])
}
