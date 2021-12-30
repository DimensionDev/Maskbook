import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'

export function useConnectSocialNetwork() {
    return useAsyncFn(Services.SocialNetwork.connectSocialNetwork)
}

export function useOpenProfilePage() {
    return useAsyncFn(Services.SocialNetwork.openProfilePage)
}

export function useDisconnectSocialNetwork(): AsyncFnReturn<(identifier: ProfileIdentifier) => Promise<void>> {
    return useAsyncFn((identifier: ProfileIdentifier) => Services.Identity.detachProfile(identifier))
}
