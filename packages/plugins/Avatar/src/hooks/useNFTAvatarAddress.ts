import { useAsyncRetry } from 'react-use'
import { useGetAddress } from './useGetAddress.js'
import { getEnhanceableSiteType } from '@masknet/shared-base'

export function useNFTAvatarAddress(userId?: string) {
    const getAddress = useGetAddress()

    return useAsyncRetry(async () => {
        if (!userId) return

        const siteType = getEnhanceableSiteType()
        if (!siteType) return

        return getAddress(siteType, userId)
    }, [userId, getAddress])
}
