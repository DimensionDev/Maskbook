import { useEffect, useState } from 'react'
import { useValueRef } from '@masknet/shared'
import { useChainId, useCollectibles, ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import type { User, FilterContract } from '../types'
import { PetCollections } from '../constants'
import { currentNonFungibleAssetDataProviderSettings } from '../../Wallet/settings'

function initContracts() {
    return PetCollections.map((i) => ({ ...i, tokens: [] }))
}

export function useNfts(user: User) {
    const [nfts, setNfts] = useState<FilterContract[]>(initContracts())
    const [page, setPage] = useState(0)
    const chainId = useChainId()
    const [fetchTotal, setFetchtotal] = useState<ERC721TokenDetailed[]>([])
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const { value = { collectibles: [], hasNextPage: false } } = useCollectibles(
        user.address,
        chainId,
        provider,
        page,
        50,
    )
    const { collectibles = [], hasNextPage } = value
    useEffect(() => {
        if (collectibles.length === 0) return
        const total = [...fetchTotal, ...collectibles]
        console.log('total', total)
        setFetchtotal(total)
        const tempNfts: FilterContract[] = initContracts()
        total.forEach((x) => {
            tempNfts.forEach((y, idx) => {
                if (y.contract.toLowerCase() === x.contractDetailed.address.toLowerCase()) {
                    tempNfts[idx].tokens.push({ ...x.info, tokenId: x.tokenId })
                }
            })
        })
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
    }, [collectibles])
    return nfts
}
