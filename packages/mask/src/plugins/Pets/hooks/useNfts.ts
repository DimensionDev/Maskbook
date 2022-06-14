import { useEffect, useState } from 'react'
import { NetworkPluginID, isSameAddress, Constant } from '@masknet/web3-shared-base'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'
import { findLastIndex } from 'lodash-unified'
import type { User, FilterContract } from '../types'
import { Punk3D } from '../constants'
import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'

export function useNFTs(user: User | undefined, configNFTs: Record<string, Constant> | undefined) {
    const [nfts, setNfts] = useState<FilterContract[]>([])
    const blacklist = Object.values(configNFTs ?? {}).map((v) => v.Mainnet)
    const { value: assets = [], loading: state } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        const tempNFTs: FilterContract[] = []
        if (assets?.length) {
            for (const NFT of assets) {
                let sameNFT = tempNFTs.find((temp) => isSameAddress(temp.contract, NFT.address))
                if (!sameNFT) {
                    sameNFT = {
                        name: NFT.metadata?.name ?? '',
                        contract: NFT.address,
                        icon: NFT.metadata?.imageURL ?? '',
                        tokens: [],
                        chainId: NFT.metadata?.chainId,
                    }
                    tempNFTs.push(sameNFT)
                } else {
                    if (!sameNFT.icon) {
                        sameNFT.icon = NFT.metadata?.imageURL ?? ''
                    }
                }
                const isPunk = isSameAddress(NFT.address, Punk3D.contract) && NFT.tokenId === Punk3D.tokenId
                if (isPunk && NFT.metadata) {
                    NFT.metadata.mediaURL = Punk3D.url
                }
                const glbSupport = NFT.metadata?.imageURL?.endsWith('.glb') || isPunk
                if (NFT.metadata?.imageURL?.includes('ipfs://')) {
                    NFT.metadata.imageURL = resolveIPFSLink(NFT.metadata.imageURL.replace('ipfs://', ''))
                }
                const item = { ...NFT, tokenId: NFT.tokenId, glbSupport }
                const sameTokenIndex = findLastIndex(sameNFT.tokens, (v) => v.tokenId === NFT.tokenId)
                if (sameTokenIndex === -1) {
                    sameNFT.tokens.push(item)
                } else {
                    sameNFT.tokens[sameTokenIndex] = item
                }
            }
        }
        tempNFTs.sort(
            (a: FilterContract, b: FilterContract) => blacklist.indexOf(a.contract) - blacklist.indexOf(b.contract),
        )
        setNfts(tempNFTs)
        return () => {}
    }, [JSON.stringify(user), JSON.stringify(assets)])
    return { nfts, state }
}
