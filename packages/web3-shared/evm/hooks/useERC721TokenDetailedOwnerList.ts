import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useOpenseaAPIConstants } from '../constants'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { safeNonPayableTransactionCall } from '../utils'
import type { ERC721ContractDetailed, ERC721TokenDetailed } from '../types'
import { getERC721TokenDetailedFromChain, getERC721TokenAssetFromChain } from './useERC721TokenDetailed'
import { useEffect, useRef, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { useChainId } from './useChainId'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useERC721TokenDetailedOwnerList(contractDetailed: ERC721ContractDetailed | undefined, owner: string) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '', true)
    const allListRef = useRef<ERC721TokenDetailed[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        setRefreshing(true)
        clearTokenDetailedOwnerList()
    }, [owner, contractDetailed?.address])

    const asyncRetry = useAsyncRetry(async () => {
        if (
            !erc721TokenContract ||
            !contractDetailed?.address ||
            !EthereumAddress.isValid(contractDetailed?.address) ||
            !owner
        ) {
            setRefreshing(false)
            return
        }

        const lists = await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner)
        allListRef.current = uniqBy<ERC721TokenDetailed>([...allListRef.current, ...lists], 'tokenId')

        setRefreshing(false)

        // lazy load token info after set loading status to false
        const allRequest = allListRef.current.map(async (nft) => {
            // there's no tokenURI or info already loaded.
            if (!nft.info.tokenURI || nft.info.hasTokenDetailed) return nft
            const info = await getERC721TokenAssetFromChain(nft.info.tokenURI)
            if (info) nft.info = { ...info, ...nft.info, hasTokenDetailed: true, name: info.name ?? nft.info.name }
            return nft
        })

        allListRef.current = (await Promise.allSettled(allRequest)).map((x, i) => {
            if (x.status === 'fulfilled') return x.value
            allListRef.current[i].info.hasTokenDetailed = true
            return allListRef.current[i]
        })

        return
    }, [GET_ASSETS_URL, contractDetailed, owner, chainId])

    const clearTokenDetailedOwnerList = () => (allListRef.current = [])

    return {
        asyncRetry,
        tokenDetailedOwnerList: allListRef.current,
        clearTokenDetailedOwnerList,
        refreshing,
    }
}

async function getERC721TokenDetailedOwnerListFromChain(
    erc721TokenContract: ERC721,
    contractDetailed: ERC721ContractDetailed,
    owner: string,
) {
    const isEnumerable = await safeNonPayableTransactionCall(
        erc721TokenContract.methods.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID),
    )

    const balance = await safeNonPayableTransactionCall(erc721TokenContract.methods.balanceOf(owner))

    if (!isEnumerable || !balance) return []

    const allRequest = Array.from({ length: Number(balance) }).map(async (_v, i) => {
        const tokenId = await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenOfOwnerByIndex(owner, i))

        if (!tokenId) return

        return getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
    })

    return (await Promise.allSettled(allRequest))
        .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        .filter((value) => value) as ERC721TokenDetailed[]
}
