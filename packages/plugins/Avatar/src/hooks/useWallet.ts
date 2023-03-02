import { useAsyncRetry } from 'react-use'
import { useGetAddress } from './useGetAddress.js'
import { type EnhanceableSite, getSiteType } from '@masknet/shared-base'

export function useWallet(userId?: string) {
    const getAddress = useGetAddress()
    return useAsyncRetry(async () => {
        if (!userId) return
        return getAddress(getSiteType() as EnhanceableSite, userId)
    }, [userId, getAddress])
}
