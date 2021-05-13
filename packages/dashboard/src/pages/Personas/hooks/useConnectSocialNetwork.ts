import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'
import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export function useConnectSocialNetwork() {
    return useAsyncFn(Services.SocialNetwork.connectSocialNetwork)
}

export function useDisconnectSocialNetwork() {
    return useAsyncFn(async (identifier?: ProfileIdentifier) => {
        if (identifier) {
            //TODO: Maybe need snackbar
            await Services.Identity.detachProfile(identifier)
        }
    }, [])
}
