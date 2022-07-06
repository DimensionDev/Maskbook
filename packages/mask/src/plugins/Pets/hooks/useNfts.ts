import { useMemo } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { resolveIPFSLink, ChainId } from '@masknet/web3-shared-evm'
import type { User, NonFungibleContract, OwnerERC721TokenInfo } from '../types'
import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useNFTs(user: User | undefined) {
    const { value: assets = EMPTY_LIST, loading: state } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    return useMemo(() => {
        const tempNFTs: Record<string, NonFungibleContract> = {}
        if (assets?.length) {
            for (const NFT of assets) {
                if (NFT.chainId !== ChainId.Mainnet) continue
                const glbSupport = NFT.metadata?.imageURL?.endsWith('.glb') ?? false
                if (NFT.metadata?.imageURL?.includes('ipfs://')) {
                    NFT.metadata.imageURL = resolveIPFSLink(NFT.metadata.imageURL.replace('ipfs://', ''))
                }
                const tokens: Record<string, OwnerERC721TokenInfo> = {
                    ...tempNFTs[NFT.address]?.tokens,
                    [NFT.tokenId]: { ...NFT, tokenId: NFT.tokenId, glbSupport },
                }
                tempNFTs[NFT.address] = {
                    name: (NFT.collection?.name || NFT.contract?.name) ?? '',
                    contract: NFT.address,
                    icon: (NFT.collection?.iconURL || NFT.metadata?.imageURL) ?? '',
                    tokens,
                    chainId: NFT.chainId,
                }
            }
        }
        const nfts = Object.values(tempNFTs).map((v) => ({ ...v, tokens: Object.values(v.tokens) }))
        return { nfts, state }
    }, [JSON.stringify(user), JSON.stringify(assets), state])
}
