import { useMemo } from 'react'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import type { NonFungibleContract, OwnerERC721TokenInfo } from '../types.js'
import { useChainContext, useNonFungibleAssets } from '@masknet/web3-hooks-base'

export function useNFTs() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: assets = EMPTY_LIST, loading: state } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId,
    })
    const nfts = useMemo(() => {
        const map: Record<string, NonFungibleContract> = {}
        if (assets.length) {
            for (const NFT of assets) {
                const glbSupport = NFT.metadata?.imageURL?.endsWith('.glb') ?? false
                if (NFT.metadata?.imageURL) {
                    NFT.metadata.imageURL = resolveIPFS_URL(NFT.metadata.imageURL)
                }
                const tokens: Record<string, OwnerERC721TokenInfo> = {
                    ...map[NFT.address].tokens,
                    [NFT.tokenId]: { ...NFT, tokenId: NFT.tokenId, glbSupport },
                }
                map[NFT.address] = {
                    name: (NFT.collection?.name || NFT.contract?.name) ?? '',
                    contract: NFT.address,
                    icon: (NFT.collection?.iconURL || NFT.metadata?.imageURL) ?? '',
                    tokens,
                    chainId: NFT.chainId,
                }
            }
        }
        const nfts = Object.values(map).map((v) => ({ ...v, tokens: Object.values(v.tokens) }))
        return nfts
    }, [assets])

    return { nfts, state }
}
