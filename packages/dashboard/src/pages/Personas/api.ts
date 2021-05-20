import { createGlobalState } from '@dimensiondev/maskbook-shared'
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
    (x) => {
        const a = Messages.events.personaChanged.on(x)
        const b = Messages.events.profilesChanged.on(x)
        return () => void [a(), b()]
    },
)

export const [useAppearance] = createGlobalState(Services.Settings.getTheme, (x) =>
    Messages.events.createInternalSettingsChanged.on(x),
)

export const [useCurrentPersonaIdentifier] = createGlobalState(Services.Settings.getCurrentPersonaIdentifier, (x) =>
    Messages.events.createInternalSettingsChanged.on(x),
)
