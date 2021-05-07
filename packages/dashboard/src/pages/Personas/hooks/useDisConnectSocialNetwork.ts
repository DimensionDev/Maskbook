import { useAsyncFn } from 'react-use'
import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'
import { Services } from '../../../API'

export function useDisConnectSocialNetwork() {
    return useAsyncFn(async (identifier?: ProfileIdentifier) => {
        if (identifier) {
            //TODO: Maybe need snackbar
            await Services.Identity.detachProfile(identifier)
        }
    }, [])
}
