import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'
import type { SocialNetworkProvider } from '../type'

export function useConnectSocialNetwork() {
    return useAsyncFn(async (identifier: string, provider: SocialNetworkProvider) => {
        return Services.SocialNetwork.connectSocialNetwork(identifier, provider)
    })
}
