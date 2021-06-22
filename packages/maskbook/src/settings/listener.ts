import { Environment, isEnvironment, ValueRef } from '@dimensiondev/holoflows-kit'
import { MaskMessage, sideEffect } from '../utils'
import { allPostReplacementSettings, appearanceSettings, languageSettings, debugModeSetting } from './settings'

export function ToBeListened() {
    return {
        allPostReplacementSettings,
        appearanceSettings,
        languageSettings,
        debugModeSetting,
    }
}
type SettingsEventName = ReturnType<typeof ToBeListened>

export type SettingsEvents = {
    [key in keyof SettingsEventName]: SettingsEventName[key] extends ValueRef<infer T> ? T : void
}
sideEffect.then(() => {
    if (!isEnvironment(Environment.ManifestBackground)) return
    const obj = ToBeListened()
    for (const _key in obj) {
        const key = _key as keyof SettingsEventName
        obj[key].addListener((data) => MaskMessage.events[key].sendToAll(data as never))
    }
})
