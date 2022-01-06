import { useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { OpenSea } from '@masknet/web3-providers'
import { useValueRef } from '@masknet/shared'
import {
    useChainId,
    useCollectibles,
    useNFTListConstants,
    ERC721TokenDetailed,
    isSameAddress,
    ERC721ContractDetailed,
} from '@masknet/web3-shared-evm'
import type { User, FilterContract } from '../types'
import { currentNonFungibleAssetDataProviderSettings } from '../../Wallet/settings'
import { Punk3D } from '../constants'
import { delay } from '@masknet/shared-base'

function useInitNFTs() {
    const nftList = useNFTListConstants()
    return useMemo(() => {
        return Object.keys(nftList).map((i) => {
            const value = nftList[i as keyof typeof nftList]
            return { name: i, contract: value || '', tokens: [] }
        })
    }, [nftList])
}

export function useNfts(user: User | undefined) {
    const initContracts = useInitNFTs()
    const [nfts, setNfts] = useState<FilterContract[]>(initContracts)
    const [page, setPage] = useState(0)
    const chainId = useChainId()
    const [fetchTotal, setFetchTotal] = useState<ERC721TokenDetailed[]>([])
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const { value = { collectibles: [], hasNextPage: false } } = useCollectibles(
        user?.address ?? '',
        chainId,
        provider,
        page,
        50,
    )
    const { collectibles = [], hasNextPage } = value
    useEffect(() => {
        const tempNfts: FilterContract[] = initContracts
        if (collectibles.length) {
            const total = [...fetchTotal, ...collectibles]
            setFetchTotal(total)
            total.forEach((x) => {
                tempNfts.forEach((y, idx) => {
                    if (!isSameAddress(y.contract, x.contractDetailed.address)) return
                    const glbSupport =
                        isSameAddress(x.contractDetailed.address, Punk3D.contract) && x.tokenId === Punk3D.tokenId
                    tempNfts[idx].tokens.push({ ...x.info, tokenId: x.tokenId, glbSupport })
                })
            })
        }
        setNfts(tempNfts)
        if (hasNextPage) {
            const timer = setTimeout(() => {
                setPage(page + 1)
            }, 1000)
            return () => {
                clearTimeout(timer)
            }
        }
        return () => {}
    }, [user, collectibles])
    return nfts
}

export function useNftsExtra(open: boolean) {
    const nfts = useInitNFTs()
    const [retry, setRetry] = useState(0)
    const chainId = useChainId()
    const [extra, setExtra] = useState<ERC721ContractDetailed[]>([])
    let timer: NodeJS.Timeout
    useAsync(async () => {
        if (retry > 5) return
        let requests = []
        if (!extra.length) {
            requests = nfts.map((nft) => OpenSea.getContract(nft.contract, chainId))
        } else {
            //openSea request should not immediately
            await delay(1500)
            requests = extra.map((nft, index) => {
                if (nft.symbol && nft.name !== 'Unknown Token') {
                    return Promise.resolve(nft)
                }
                return OpenSea.getContract(nfts[index].contract, chainId)
            })
        }
        const lists: ERC721ContractDetailed[] = []
        for (const i of requests) {
            lists.push(await i)
        }
        setExtra(lists)
        setRetry(retry + 1)
    }, [nfts, JSON.stringify(extra)])
    return extra
}
