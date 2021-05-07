import { createGlobalState } from '@dimensiondev/maskbook-shared'
import { Services, Messages } from '../../API'

export const [
    useDefinedSocialNetworkUIs,
    revalidateSocialNetworkUIs,
    definedSocialNetworkUIs,
] = createGlobalState(Services.SocialNetwork.getDefinedSocialNetworkUIs, () => () => {})

export const [useMyPersonas, revalidateMyPersonas, myPersonas] = createGlobalState(
    Services.Identity.queryMyPersonas,
    Messages.events.personaChanged.on,
)
