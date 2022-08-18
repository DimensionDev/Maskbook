import type { EnhanceableSite } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useGetAddress } from './useGetAddress'

export function useWallet(userId: string) {
    const getAddress = useGetAddress()
    return useAsyncRetry(async () => {
        return getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId)
    }, [userId, getAddress])
}
