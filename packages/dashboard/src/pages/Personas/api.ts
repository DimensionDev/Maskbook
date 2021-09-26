import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'

export type SocialNetwork = {
    networkIdentifier: string
}
export const [useDefinedSocialNetworkUIs, revalidateSocialNetworkUIs, definedSocialNetworkUIs] = createGlobalState(
    Services.SocialNetwork.getDefinedSocialNetworkUIs,
    () => () => {},
)
export const [useOwnedPersonas, , currentPersonas] = createGlobalState(
    Services.Identity.queryOwnedPersonaInformation,
    (x) => Messages.events.ownPersonaChanged.on(x),
)

export const [useAppearance] = createGlobalState(Services.Settings.getTheme, (x) =>
    Messages.events.appearanceSettings.on(x),
)

export const [useCurrentPersonaIdentifier] = createGlobalState(Services.Settings.getCurrentPersonaIdentifier, (x) =>
    Messages.events.currentPersonaIdentifier.on(x),
)

export const [usePersonaAvatar] = createGlobalState(Services.Identity.getCurrentPersonaAvatar, (x) => {
    const a = Messages.events.currentPersonaIdentifier.on(x)
    const b = Messages.events.ownPersonaChanged.on(x)
    return () => void [a(), b()]
})

export const updatePersonaAvatar = Services.Identity.updateCurrentPersonaAvatar
