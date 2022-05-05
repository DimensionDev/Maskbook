import { useEffect, useMemo, useState } from 'react'
import {
    useChainId,
    useCollectibles,
    ERC721TokenDetailed,
    isSameAddress,
    SocketState,
    resolveIPFSLink,
    Constant,
    transform,
} from '@masknet/web3-shared-evm'
import { findLastIndex } from 'lodash-unified'
import type { User, FilterContract } from '../types'
import { Punk3D } from '../constants'

function useInitNFTs(config: Record<string, Constant> | undefined) {
    return useMemo(() => {
        if (!config) return []
        const nftList = transform(config)()
        return Object.keys(nftList).map((i) => {
            const value = nftList[i as keyof typeof nftList]
            return { name: i, contract: value as string, icon: '', tokens: [] }
        })
    }, [config])
}

export function useNFTs(user: User | undefined) {
    const [nfts, setNfts] = useState<FilterContract[]>([])
    const chainId = useChainId()
    const [fetchTotal, setFetchTotal] = useState<ERC721TokenDetailed[]>([])
    // const { data: collectibles, state } = useCollectibles(user?.address ?? '', chainId)
    const { data: collectibles, state } = useCollectibles('0x141721F4D7Fd95541396E74266FF272502Ec8899', chainId)
    console.log('nfts::::', collectibles)
    useEffect(() => {
        const tempNFTs: FilterContract[] = []
        if (collectibles.length && (state === SocketState.done || state === SocketState.sent)) {
            const total = [...fetchTotal, ...collectibles]
            setFetchTotal(total)
            for (const NFT of total) {
                let sameNFT = tempNFTs.find((temp) => isSameAddress(temp.contract, NFT.contractDetailed.address))
                if (!sameNFT) {
                    sameNFT = {
                        name: NFT.contractDetailed.name,
                        contract: NFT.contractDetailed.address,
                        icon: NFT.contractDetailed.iconURL ?? '',
                        tokens: [],
                    }
                    tempNFTs.push(sameNFT)
                } else {
                    if (!sameNFT.icon) {
                        sameNFT.icon = NFT.contractDetailed.iconURL ?? ''
                    }
                }
                const isPunk =
                    isSameAddress(NFT.contractDetailed.address, Punk3D.contract) && NFT.tokenId === Punk3D.tokenId
                if (isPunk) {
                    NFT.info.mediaUrl = Punk3D.url
                }
                const glbSupport = NFT.info.mediaUrl?.endsWith('.glb') || isPunk
                if (NFT.info.mediaUrl?.includes('ipfs://')) {
                    NFT.info.mediaUrl = resolveIPFSLink(NFT.info.mediaUrl.replace('ipfs://', ''))
                }
                const item = { ...NFT.info, tokenId: NFT.tokenId, glbSupport }
                const sameTokenIndex = findLastIndex(sameNFT.tokens, (v) => v.tokenId === NFT.tokenId)
                if (sameTokenIndex === -1) {
                    sameNFT.tokens.push(item)
                } else {
                    sameNFT.tokens[sameTokenIndex] = item
                }
            }
        }
        setNfts(tempNFTs)
        return () => {}
    }, [JSON.stringify(user), JSON.stringify(collectibles), state])
    return nfts
}
