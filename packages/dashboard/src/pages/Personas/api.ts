import { createGlobalState } from '@masknet/shared-base-ui'
import { Services, Messages } from '../../API.js'
import { noop } from 'lodash-unified'

export type SocialNetwork = {
    networkIdentifier: string
}

export const [useSupportedSocialNetworkSites] = createGlobalState(
    () => Services.SocialNetwork.getSupportedSites({ isSocialNetwork: true }),
    () => noop,
)

export const [useOwnedPersonas] = createGlobalState(
    () => Services.Identity.queryOwnedPersonaInformation(false),
    (x) => Messages.events.ownPersonaChanged.on(x),
)

export const [useAppearance] = createGlobalState(Services.Settings.getTheme, (x) =>
    Messages.events.appearanceSettings.on(x),
)

export const [usePluginID] = createGlobalState(Services.Settings.getPluginID, (x) =>
    Messages.events.pluginIDSettings.on(x),
)

export const [useCurrentPersonaIdentifier] = createGlobalState(Services.Settings.getCurrentPersonaIdentifier, (x) =>
    Messages.events.currentPersonaIdentifier.on(x),
)

export const [usePersonaAvatar] = createGlobalState(
    () => Services.Settings.getCurrentPersonaIdentifier().then(Services.Identity.getPersonaAvatar),
    (x) => {
        const a = Messages.events.currentPersonaIdentifier.on(x)
        const b = Messages.events.ownPersonaChanged.on(x)
        return () => void [a(), b()]
    },
)
