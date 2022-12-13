import type {} from 'react/next'
import { noop } from 'lodash-es'
import { Services, Messages } from '../../API.js'
import { createHook } from '../../utils/createHook.js'

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
