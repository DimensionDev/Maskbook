import { useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import type { RSS3_KEY_SNS } from '../../constants'
import type { NFTRSSNode } from '../../types'

export function useGetNFTAvatarFromRSS3() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async (userId: string, address: string, snsKey: RSS3_KEY_SNS) => {
            if (!Storage) return
            const rss3Storage = Storage.createRSS3Storage(address)
            const result = await rss3Storage.get<Record<string, NFTRSSNode>>(snsKey)
            if (result) {
                return result[userId].nft
            }

            return (await rss3Storage.get<NFTRSSNode>('_nft'))?.nft
        },
        [Storage],
    )
}
