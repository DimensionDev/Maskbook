import { useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { OpenSea } from '@masknet/web3-providers'
import {
    NetworkPluginID,
    isSameAddress,
    NonFungibleTokenContract,
    transform,
    NonFungibleAsset,
    Constant,
} from '@masknet/web3-shared-base'
import { resolveIPFSLink, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { cloneDeep, findLastIndex } from 'lodash-unified'
import { delay } from '@dimensiondev/kit'
import type { User, FilterContract } from '../types'
import { Punk3D } from '../constants'
import { useChainId, useNonFungibleAssets } from '@masknet/plugin-infra/web3'

function useInitNFTs(config: Record<string, Constant> | undefined) {
    return useMemo(() => {
        if (!config) return []
        const nftList = transform(ChainId, config)()
        return Object.keys(nftList).map((i) => {
            const value = nftList[i as keyof typeof nftList]
            return { name: i, contract: value as string, tokens: [] }
        })
    }, [config])
}

export function useNFTs(user: User | undefined, configNFTs: Record<string, Constant> | undefined) {
    const initContracts = useInitNFTs(configNFTs)
    const [nfts, setNfts] = useState<FilterContract[]>(initContracts)
    const [fetchTotal, setFetchTotal] = useState<Array<NonFungibleAsset<ChainId, SchemaType>>>([])
    const { value: collectibles } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        if (!initContracts.length) return
        const tempNFTs: FilterContract[] = cloneDeep(initContracts)
        if (collectibles?.length) {
            const total = [...fetchTotal, ...collectibles]
            setFetchTotal(total)
            for (const NFT of total) {
                const sameNFT = tempNFTs.find((temp) => isSameAddress(temp.contract, NFT.address))
                if (!sameNFT) continue
                const isPunk = isSameAddress(NFT.address, Punk3D.contract) && NFT.tokenId === Punk3D.tokenId
                if (isPunk && NFT.metadata) {
                    NFT.metadata.imageURL = Punk3D.url
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
        setNfts(tempNFTs)
        return () => {}
    }, [JSON.stringify(user), JSON.stringify(collectibles), JSON.stringify(initContracts)])
    return nfts
}

export function useNFTsExtra(configNFTs: Record<string, Constant> | undefined) {
    const initContracts = useInitNFTs(configNFTs)
    const [retry, setRetry] = useState(0)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [extra, setExtra] = useState<Array<NonFungibleTokenContract<ChainId, SchemaType>>>([])
    useAsync(async () => {
        if (!initContracts.length) return
        if (retry > 2) return
        let requests = []
        if (!extra.length) {
            requests = initContracts.map((nft) => OpenSea.getContract(nft.contract, { chainId }))
        } else {
            // openSea api request should not immediately
            await delay(3000)
            requests = extra.map((nft, index) => {
                if (nft.symbol && nft.name !== 'Unknown Token') {
                    return Promise.resolve(nft)
                }
                return OpenSea.getContract(initContracts[index].contract, { chainId })
            })
        }
        const lists: Array<NonFungibleTokenContract<ChainId, SchemaType>> = await Promise.all(requests)
        setExtra(lists)
        setRetry(retry + 1)
    }, [retry, JSON.stringify(initContracts)])
    return extra
}
