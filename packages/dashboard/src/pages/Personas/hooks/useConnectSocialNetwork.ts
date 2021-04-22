import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'

export interface SocialNetworkProvider {
    internalName: string
    network: string
    connected: boolean
}

export function useConnectSocialNetwork() {
    return useAsyncFn(async (identifier: string, provider: SocialNetworkProvider) => {
        return Services.SocialNetwork.connectSocialNetwork(identifier, provider)
    })
}
