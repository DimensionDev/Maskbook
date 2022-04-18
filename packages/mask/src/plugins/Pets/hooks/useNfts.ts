import { useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { OpenSea } from '@masknet/web3-providers'
import { resolveIPFSLink, Constant, transform } from '@masknet/web3-shared-evm'
import { cloneDeep, findLastIndex, set } from 'lodash-unified'
import { delay } from '@dimensiondev/kit'
import type { User, FilterContract } from '../types'
import { Punk3D } from '../constants'
import { useNonFungibleAssets, useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { IteratorCollectorStatus } from '@masknet/web3-shared-base'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'

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
    const { Utils } = useWeb3State()
    const [nfts, setNfts] = useState<FilterContract[]>(initContracts)
    const chainId = useChainId()
    const [fetchTotal, setFetchTotal] = useState<Web3Plugin.NonFungibleAsset[]>([])
    const { data: collectibles, status } = useNonFungibleAssets(user?.address ?? '', chainId)
    useEffect(() => {
        if (!initContracts.length) return
        const tempNFTs: FilterContract[] = cloneDeep(initContracts)
        if (
            collectibles.length &&
            (status === IteratorCollectorStatus.done || status === IteratorCollectorStatus.fetching)
        ) {
            const total = [...fetchTotal, ...collectibles]
            setFetchTotal(total)
            for (const NFT of total) {
                const sameNFT = tempNFTs.find((temp) => Utils?.isSameAddress?.(temp.contract, NFT.contract?.address))
                if (!sameNFT) continue
                const isPunk =
                    Utils?.isSameAddress?.(NFT.contract?.address, Punk3D.contract) && NFT.tokenId === Punk3D.tokenId
                if (isPunk) {
                    set(NFT, 'metadata.mediaURL', Punk3D.url)
                }
                const glbSupport = NFT.metadata?.mediaURL?.endsWith('.glb') || isPunk
                if (NFT.metadata?.mediaURL?.includes('ipfs://')) {
                    NFT.metadata.mediaURL = resolveIPFSLink(NFT.metadata?.mediaURL.replace('ipfs://', ''))
                }
                const item = { ...NFT.metadata, tokenId: NFT.tokenId, glbSupport: !!glbSupport }
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
    }, [JSON.stringify(user), JSON.stringify(collectibles), status, JSON.stringify(initContracts)])
    return nfts
}

export function useNFTsExtra(configNFTs: Record<string, Constant> | undefined) {
    const initContracts = useInitNFTs(configNFTs)
    const [retry, setRetry] = useState(0)
    const chainId = useChainId()
    const [extra, setExtra] = useState<Web3Plugin.NonFungibleTokenContract[]>([])
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
        const lists: Web3Plugin.NonFungibleTokenContract[] = await Promise.all(requests)
        setExtra(lists)
        setRetry(retry + 1)
    }, [retry, JSON.stringify(initContracts)])
    return extra
}
