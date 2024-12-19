import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNonFungibleAssetsByCollectionAndOwner } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { useEffect, useMemo } from 'react'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import type { OrderedERC721Token } from '../../types.js'

export function useMyCollectionNfts() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { collection } = useRedPacket()

    const collectionId =
        collection?.assets?.length ? ''
        : collection?.source === SourceType.SimpleHash ? collection.id
        : collection?.address
    const result = useNonFungibleAssetsByCollectionAndOwner(collectionId, account, NetworkPluginID.PLUGIN_EVM, {
        chainId,
        size: 50,
    })
    const { data: assets_ = EMPTY_LIST, hasNextPage, fetchNextPage } = result

    const assets = collection?.assets?.length ? collection.assets : assets_
    const nfts = useMemo(() => assets.map((v, index) => ({ ...v, index }) as OrderedERC721Token), [assets])

    useEffect(() => {
        if (hasNextPage) fetchNextPage()
    }, [hasNextPage, fetchNextPage])

    return { ...result, data: nfts }
}
