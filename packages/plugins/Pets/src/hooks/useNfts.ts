import { useEffect, useMemo } from 'react'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import type { NonFungibleContract, OwnerERC721TokenInfo } from '../types.js'
import { useChainContext, useNonFungibleAssets } from '@masknet/web3-hooks-base'
import { isLens, isLensCollect, isLensComment, isLensFollower, isLensPost } from '@masknet/web3-shared-evm'

export function useNFTs() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        data: assets = EMPTY_LIST,
        isPending,
        hasNextPage,
        fetchNextPage,
        dataUpdatedAt,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    useEffect(() => {
        if (!hasNextPage) return
        fetchNextPage()
    }, [isPending, hasNextPage, fetchNextPage, dataUpdatedAt])

    const nfts = useMemo(() => {
        const map: Record<string, NonFungibleContract> = {}
        if (!assets.length) {
            return EMPTY_LIST
        }
        const normalAssets = assets.filter((x) => {
            const name = x.collection?.name || x.contract?.name || x.metadata?.name
            if (!name) return true
            if (isLensFollower(name) || isLensComment(name) || isLensPost(name) || isLensCollect(name) || isLens(name))
                return false
            return true
        })
        for (const asset of normalAssets) {
            const glbSupport = asset.metadata?.imageURL?.endsWith('.glb') ?? false
            if (asset.metadata?.imageURL) {
                asset.metadata.imageURL = resolveIPFS_URL(asset.metadata.imageURL)
            }
            const tokens: Record<string, OwnerERC721TokenInfo> = {
                ...map[asset.address]?.tokens,
                [asset.tokenId]: { ...asset, tokenId: asset.tokenId, glbSupport },
            }
            map[asset.address] = {
                name: (asset.collection?.name || asset.contract?.name) ?? '',
                contract: asset.address,
                icon: (asset.collection?.iconURL || asset.metadata?.imageURL) ?? '',
                tokens,
                chainId: asset.chainId,
            }
        }
        const nfts = Object.values(map).map((v) => ({ ...v, tokens: Object.values(v.tokens) }))
        return nfts
    }, [assets])

    return { nfts, isPending }
}
