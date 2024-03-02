import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import { NetworkPluginID, type EnhanceableSite } from '@masknet/shared-base'
import { useGetAddress } from './useGetAddress.js'
import { useGetNFTAvatarFromStorage } from './useGetNFTAvatarFromStorage.js'
import { NFT_AVATAR_METADATA_STORAGE, type RSS3_KEY_SITE } from '../constants.js'
import type { NextIDAvatarMeta } from '../types.js'
import { useGetNFTAvatarFromRSS3 } from './useGetNFTAvatarFromRSS3.js'

export function useGetNFTAvatar() {
    const getNFTAvatarFromRSS3 = useGetNFTAvatarFromRSS3()
    const getNFTAvatarFromStorage = useGetNFTAvatarFromStorage()
    const getAddress = useGetAddress()

    return useCallback(
        async (userId?: string, network?: EnhanceableSite, key?: RSS3_KEY_SITE) => {
            if (!userId || !network || !key) return

            const addressStorage = await getAddress(network, userId)
            if (!addressStorage?.address) return

            if (addressStorage?.networkPluginID && addressStorage.networkPluginID !== NetworkPluginID.PLUGIN_EVM) {
                return Web3Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${network}`).get<NextIDAvatarMeta>(
                    userId,
                )
            }
            const user = await getNFTAvatarFromStorage(userId, addressStorage.address)
            if (user) return user
            return getNFTAvatarFromRSS3(userId, addressStorage.address, key)
        },
        [getNFTAvatarFromStorage, getAddress, Storage, getNFTAvatarFromRSS3],
    )
}
