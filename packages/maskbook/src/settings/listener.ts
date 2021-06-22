import { Environment, isEnvironment, ValueRef } from '@dimensiondev/holoflows-kit'
import { MaskMessage, sideEffect, startEffect } from '../utils'
import {
    allPostReplacementSettings,
    appearanceSettings,
    languageSettings,
    debugModeSetting,
    disableOpenNewTabInBackgroundSettings,
    currentPersonaIdentifier,
} from './settings'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentCollectibleDataProviderSettings,
    currentNetworkSettings,
    currentPortfolioDataProviderSettings,
    currentProviderSettings,
} from '../plugins/Wallet/settings'
import { currentTrendingDataProviderSettings } from '../plugins/Trader/settings'

export function ToBeListened() {
    return {
        allPostReplacementSettings,
        appearanceSettings,
        languageSettings,
        debugModeSetting,
        currentChainIdSettings,
        currentBalanceSettings,
        currentBlockNumberSettings,
        currentTrendingDataProviderSettings,
        disableOpenNewTabInBackgroundSettings,
        currentProviderSettings,
        currentNetworkSettings,
        currentAccountSettings,
        currentPortfolioDataProviderSettings,
        currentCollectibleDataProviderSettings,
        currentPersonaIdentifier,
    }
}
type SettingsEventName = ReturnType<typeof ToBeListened>

export type SettingsEvents = {
    [key in keyof SettingsEventName]: SettingsEventName[key] extends ValueRef<infer T> ? T : void
}
startEffect(import.meta.webpackHot, (abort) => {
    sideEffect.then(() => {
        if (!isEnvironment(Environment.ManifestBackground)) return
        const obj = ToBeListened()
        for (const _key in obj) {
            const key = _key as keyof SettingsEventName
            abort.signal.addEventListener(
                'abort',
                obj[key].addListener((data) => MaskMessage.events[key].sendToAll(data as never)),
            )
        }
    })
    return () => {}
})
