import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import { NFT_AVATAR_METADATA_STORAGE, RSS3_KEY_SNS } from '../constants.js'
import type { NextIDAvatarMeta } from '../types.js'
import { useGetNFTAvatarFromRSS3 } from './rss3/useGetNFTAvatarFromRSS3.js'
import { useGetAddress } from './useGetAddress.js'

export function useGetNFTAvatar() {
    const getNFTAvatarFromRSS = useGetNFTAvatarFromRSS3()
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
            return getNFTAvatarFromRSS(userId, addressStorage.address, snsKey)
        },
        [getNFTAvatarFromRSS, getAddress, Storage],
    )
}
