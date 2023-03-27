import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { type EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { NFT_AVATAR_METADATA_STORAGE, type RSS3_KEY_SNS } from '../constants.js'
import type { NextIDAvatarMeta } from '../types.js'
import { useGetAddress } from './useGetAddress.js'
import { useGetNFTAvatarFromStorage } from './storage/useGetNFTAvtarFromStorage.js'

export function useGetNFTAvatar() {
    const getNFTAvatarFromStorage = useGetNFTAvatarFromStorage()
    const { Storage } = useWeb3State()
    const getAddress = useGetAddress()
    return useCallback(
        async (userId?: string, network?: EnhanceableSite, snsKey?: RSS3_KEY_SNS) => {
            if (!userId || !network || !snsKey) return
            const addressStorage = await getAddress(network, userId)
            if (!addressStorage?.address) return
            if (addressStorage?.networkPluginID && addressStorage.networkPluginID !== NetworkPluginID.PLUGIN_EVM) {
                return Storage?.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${network}`).get<NextIDAvatarMeta>(
                    userId,
                )
            }
            return getNFTAvatarFromStorage(userId, addressStorage.address)
        },
        [getNFTAvatarFromStorage, getAddress, Storage],
    )
}
