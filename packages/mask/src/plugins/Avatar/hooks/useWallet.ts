import type { EnhanceableSite } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { useGetAddress } from './useGetAddress.js'

export function useWallet(userId?: string) {
    const getAddress = useGetAddress()
    return useAsyncRetry(async () => {
        if (!userId) return
        return getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId)
    }, [userId, getAddress])
}
