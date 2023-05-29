import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import { StorageKey } from '../../constants.js'
import type { NextIDAvatarMeta } from '../../types.js'

export function useGetNFTAvatarFromStorage() {
    return useCallback(
        async (userId: string, address: string) => {
            const stringStorage = Web3Storage.createFireflyStorage(StorageKey, address)
            return stringStorage.get?.<NextIDAvatarMeta>(userId)
        },
        [Storage],
    )
}
