import { useEffect, useState } from 'react'
import { NetworkPluginID, Constant } from '@masknet/web3-shared-base'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'
import type { User, FilterContract, NonFungibleContract, OwnerERC721TokenInfo } from '../types'
import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useNFTs(user: User | undefined, configNFTs: Record<string, Constant> | undefined) {
    const [nfts, setNfts] = useState<FilterContract[]>([])
    const blacklist = Object.values(configNFTs ?? {}).map((v) => v.Mainnet)
    const { value: assets = EMPTY_LIST, loading: state } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        const tempNFTs: Record<string, NonFungibleContract> = {}
        if (assets?.length) {
            for (const NFT of assets) {
                const glbSupport = NFT.metadata?.imageURL?.endsWith('.glb') ?? false
                if (NFT.metadata?.imageURL?.includes('ipfs://')) {
                    NFT.metadata.imageURL = resolveIPFSLink(NFT.metadata.imageURL.replace('ipfs://', ''))
                }
                const tokens: Record<string, OwnerERC721TokenInfo> = {
                    ...tempNFTs[NFT.address].tokens,
                    [NFT.tokenId]: { ...NFT, tokenId: NFT.tokenId, glbSupport },
                }
                tempNFTs[NFT.address] = {
                    name: NFT.collection?.name ?? '',
                    contract: NFT.address,
                    icon: NFT.collection?.iconURL ?? '',
                    tokens,
                    chainId: NFT.chainId,
                }
            }
        }
        const result = Object.values(tempNFTs).map((v) => ({ ...v, tokens: Object.values(v.tokens) }))
        setNfts(result)
        return () => {}
    }, [JSON.stringify(user), JSON.stringify(assets), state])
    return { nfts, state }
}
