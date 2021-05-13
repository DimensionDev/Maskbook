import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'
import type { SocialNetworkProvider } from '../type'
import type { PersonaIdentifier } from '@dimensiondev/maskbook-shared'

export function useConnectSocialNetwork() {
    return useAsyncFn(async (identifier: PersonaIdentifier, provider: SocialNetworkProvider) => {
        return Services.SocialNetwork.connectSocialNetwork(identifier, provider.networkIdentifier)
    })
}
