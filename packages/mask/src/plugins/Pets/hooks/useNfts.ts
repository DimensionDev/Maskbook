import { useEffect, useState } from 'react'
import { useValueRef } from '@masknet/shared'
import {
    useChainId,
    useCollectibles,
    useNFTListConstants,
    ERC721TokenDetailed,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import type { User, FilterContract } from '../types'
import { currentNonFungibleAssetDataProviderSettings } from '../../Wallet/settings'
import { Punk3D } from '../constants'

export function useNfts(user: User | undefined) {
    const nftList = useNFTListConstants()
    const initContracts = Object.keys(nftList).map((i) => {
        const value = nftList[i as keyof typeof nftList]
        return { name: i, contract: value || '', tokens: [] }
    })
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
