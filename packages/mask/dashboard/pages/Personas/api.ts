/// <reference types="react/canary" />
import { use, cache } from 'react'
import { noop } from 'lodash-es'
import { ValueRef, MaskMessages } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { Services } from '../../../shared-ui/service.js'

export interface SiteAdaptor {
    networkIdentifier: string
}

export const useSupportedSocialNetworkSites = createHook(
    () => Services.SiteAdaptor.getSupportedSites({ isSocialNetwork: true }),
    noop,
)

export const useOwnedPersonas = createHook(
    () => Services.Identity.queryOwnedPersonaInformation(false),
    (x) => MaskMessages.events.ownPersonaChanged.on(x),
)

export const useAppearance = createHook(Services.Settings.getTheme, MaskMessages.events.appearanceSettings.on)

export const useCurrentPersonaIdentifier = createHook(
    Services.Settings.getCurrentPersonaIdentifier,
    MaskMessages.events.currentPersonaIdentifier.on,
)

export const usePersonaAvatar = createHook(
    () => Services.Settings.getCurrentPersonaIdentifier().then(Services.Identity.getPersonaAvatar),
    (x) => {
        MaskMessages.events.currentPersonaIdentifier.on(x)
        MaskMessages.events.ownPersonaChanged.on(x)
    },
)
export const useLanguage = createHook(Services.Settings.getLanguage, MaskMessages.events.languageSettings.on)

// Do not move or export this function.
// This function should not be encouraged to use everywhere
function createHook<T>(f: () => Promise<T>, subscribe: (callback: () => void) => void) {
    const Request = cache((_cacheKey: number) => f())
    const cacheKey = new ValueRef(0)
    subscribe(() => (cacheKey.value += 1))

    return function useData() {
        return use(Request(useValueRef(cacheKey)))
    }
}
