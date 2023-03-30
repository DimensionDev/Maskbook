import { useCallback } from 'react'
import { type EnhanceableSite } from '@masknet/shared-base'
import { useGetAddress } from './useGetAddress.js'
import { useGetNFTAvatarFromStorage } from './storage/useGetNFTAvatarFromStorage.js'

export function useGetNFTAvatar() {
    const getNFTAvatarFromStorage = useGetNFTAvatarFromStorage()
    const getAddress = useGetAddress()
    return useCallback(
        async (userId?: string, network?: EnhanceableSite) => {
            if (!userId || !network) return
            const addressStorage = await getAddress(network, userId)
            if (!addressStorage?.address) return
            return getNFTAvatarFromStorage(userId, addressStorage.address)
        },
        [getNFTAvatarFromStorage, getAddress, Storage],
    )
}
