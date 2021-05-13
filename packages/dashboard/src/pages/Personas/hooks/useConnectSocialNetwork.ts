import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'
import type { ProfileIdentifier, PersonaIdentifier } from '@dimensiondev/maskbook-shared'

export function useConnectSocialNetwork() {
    return useAsyncFn(async (network: string, identifier?: PersonaIdentifier) => {
        if (identifier) {
            await Services.SocialNetwork.connectSocialNetwork(identifier, network)
        }
    })
}

export function useDisconnectSocialNetwork() {
    return useAsyncFn(async (identifier?: ProfileIdentifier) => {
        if (identifier) {
            //TODO: Maybe need snackbar
            await Services.Identity.detachProfile(identifier)
        }
    }, [])
}
