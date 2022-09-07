import { useWeb3Connection, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import type { RSS3_KEY_SNS } from '../../constants'
import type { AvatarMetaDB, NFTRSSNode } from '../../types'

export function useSaveAvatarToRSS3() {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async (address: string, nft: AvatarMetaDB, signature: string, snsKey: RSS3_KEY_SNS) => {
            if (!Storage) return
            const storage = Storage.createRSS3Storage(address)
            const _nfts = await storage?.get<Record<string, NFTRSSNode>>(snsKey)
            await storage?.set<Record<string, NFTRSSNode>>(snsKey, {
                ...(_nfts ?? {}),
                [nft.userId]: { signature, nft },
            })

            return nft
        },
        [connection, Storage],
    )
}
