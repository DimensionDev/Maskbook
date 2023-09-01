import { useAsyncFn } from 'react-use'
import { Services } from '../../../API.js'
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'

export function useConnectSite() {
    return useAsyncFn(Services.SiteAdaptor.connectSite)
}

export function useOpenProfilePage() {
    return useAsyncFn(Services.SiteAdaptor.openProfilePage)
}

export function useDisconnectSite(): AsyncFnReturn<(identifier: ProfileIdentifier) => Promise<void>> {
    return useAsyncFn((identifier: ProfileIdentifier) => Services.Identity.detachProfile(identifier))
}
