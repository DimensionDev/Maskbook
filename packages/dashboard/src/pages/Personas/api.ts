import { createGlobalState } from '@dimensiondev/maskbook-shared'
import { Services } from '../../API'

export const [
    useDefinedSocialNetworkUIs,
    revalidateSocialNetworkUIs,
    definedSocialNetworkUIs,
] = createGlobalState(Services.SocialNetwork.getDefinedSocialNetworkUIs, () => () => {})

export const [useMyPersonas, revalidateMyPersonas] = createGlobalState(
    Services.SocialNetwork.getMyPersonas,
    () => () => {},
)
