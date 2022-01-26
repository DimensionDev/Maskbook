import { useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { OpenSea } from '@masknet/web3-providers'
import {
    useChainId,
    useCollectibles,
    ERC721TokenDetailed,
    isSameAddress,
    ERC721ContractDetailed,
    SocketState,
} from '@masknet/web3-shared-evm'
import { Constant, transform } from '@masknet/web3-shared-evm/constants/utils'
import { cloneDeep, findLastIndex } from 'lodash-unified'
import { delay } from '@masknet/shared-base'
import type { User, FilterContract } from '../types'
import { Punk3D } from '../constants'
import { RaribleIPFSURL } from '../../Collectible/constants'

function useInitNFTs(config: Record<string, Constant> | undefined) {
    return useMemo(() => {
        if (!config) return []
        const nftList = transform(config)()
        return Object.keys(nftList).map((i) => {
            const value = nftList[i as keyof typeof nftList]
            return { name: i, contract: value as string, tokens: [] }
        })
    }, [config])
}

export function useNFTs(user: User | undefined, configNFTs: Record<string, Constant> | undefined) {
    const initContracts = useInitNFTs(configNFTs)
    const [nfts, setNfts] = useState<FilterContract[]>(initContracts)
    const chainId = useChainId()
    const [fetchTotal, setFetchTotal] = useState<ERC721TokenDetailed[]>([])
    const { data: collectibles, state } = useCollectibles(user?.address ?? '', chainId)
    useEffect(() => {
        if (!initContracts.length) return
        const tempNFTs: FilterContract[] = cloneDeep(initContracts)
        if (collectibles.length && (state === SocketState.done || state === SocketState.sent)) {
            const total = [...fetchTotal, ...collectibles]
            setFetchTotal(total)
            for (const NFT of total) {
                const sameNFT = tempNFTs.find((temp) => isSameAddress(temp.contract, NFT.contractDetailed.address))
                if (!sameNFT) continue
                const isPunk =
                    isSameAddress(NFT.contractDetailed.address, Punk3D.contract) && NFT.tokenId === Punk3D.tokenId
                if (isPunk) {
                    NFT.info.mediaUrl = Punk3D.url
                }
                const glbSupport = NFT.info.mediaUrl?.endsWith('.glb') || isPunk
                if (NFT.info.mediaUrl?.includes('ipfs://')) {
                    NFT.info.mediaUrl = NFT.info.mediaUrl.replace('ipfs://', RaribleIPFSURL)
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
    }, [JSON.stringify(user), JSON.stringify(collectibles), state, JSON.stringify(initContracts)])
    return nfts
}

export function useNFTsExtra(configNFTs: Record<string, Constant> | undefined) {
    const initContracts = useInitNFTs(configNFTs)
    const [retry, setRetry] = useState(0)
    const chainId = useChainId()
    const [extra, setExtra] = useState<ERC721ContractDetailed[]>([])
    useAsync(async () => {
        if (!initContracts.length) return
        if (retry > 2) return
        let requests = []
        if (!extra.length) {
            requests = initContracts.map((nft) => OpenSea.getContract(nft.contract, chainId))
        } else {
            // openSea api request should not immediately
            await delay(3000)
            requests = extra.map((nft, index) => {
                if (nft.symbol && nft.name !== 'Unknown Token') {
                    return Promise.resolve(nft)
                }
                return OpenSea.getContract(initContracts[index].contract, chainId)
            })
        }
        const lists: ERC721ContractDetailed[] = await Promise.all(requests)
        setExtra(lists)
        setRetry(retry + 1)
    }, [retry, JSON.stringify(initContracts)])
    return extra
}
