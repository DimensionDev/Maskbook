import { use, cache } from 'react'
import type {} from 'react/next'
import { noop } from 'lodash-es'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { Services, Messages } from '../../API.js'

export type SocialNetwork = {
    networkIdentifier: string
}

export const useSupportedSocialNetworkSites = createHook(
    () => Services.SocialNetwork.getSupportedSites({ isSocialNetwork: true }),
    noop,
)

export const useOwnedPersonas = createHook(
    () => Services.Identity.queryOwnedPersonaInformation(false),
    (x) => Messages.events.ownPersonaChanged.on(x),
)

export const useAppearance = createHook(Services.Settings.getTheme, Messages.events.appearanceSettings.on)

export const useCurrentPersonaIdentifier = createHook(
    Services.Settings.getCurrentPersonaIdentifier,
    Messages.events.currentPersonaIdentifier.on,
)

export const usePersonaAvatar = createHook(
    () => Services.Settings.getCurrentPersonaIdentifier().then(Services.Identity.getPersonaAvatar),
    (x) => {
        Messages.events.currentPersonaIdentifier.on(x)
        Messages.events.ownPersonaChanged.on(x)
    },
)
export const useLanguage = createHook(Services.Settings.getLanguage, Messages.events.languageSettings.on)

function createHook<T>(f: () => Promise<T>, subscribe: (callback: () => void) => void) {
    const Request = cache((_cacheKey: number) => f())
    const cacheKey = new ValueRef(0)
    subscribe(() => (cacheKey.value += 1))

    return function useData() {
        return use(Request(useValueRef(cacheKey)))
    }
}
