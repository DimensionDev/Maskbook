import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useOpenseaAPIConstants } from '../constants'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { safeNonPayableTransactionCall } from '../utils'
import { ERC721ContractDetailed, ERC721TokenDetailed, EthereumTokenType, ChainId } from '../types'
import { getERC721TokenDetailedFromChain, getERC721TokenAssetFromChain } from './useERC721TokenDetailed'
import { useEffect, useRef, useState } from 'react'
import { min, uniqBy } from 'lodash-unified'
import urlcat from 'urlcat'
import { useChainId } from './useChainId'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useERC721TokenDetailedOwnerList(
    contractDetailed: ERC721ContractDetailed | undefined,
    owner: string,
    offset: number,
) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    const allListRef = useRef<ERC721TokenDetailed[]>([])
    const loadMore = useRef<boolean>(false)
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

        let lists: ERC721TokenDetailed[]

        if (!GET_ASSETS_URL) {
            lists = await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner, offset)
            allListRef.current = uniqBy<ERC721TokenDetailed>([...allListRef.current, ...lists], 'tokenId')
        } else {
            const tokenDetailedOwnerListFromOpensea = await getERC721TokenDetailedOwnerListFromOpensea(
                contractDetailed,
                owner,
                GET_ASSETS_URL,
                offset,
                chainId,
            )

            lists =
                tokenDetailedOwnerListFromOpensea ??
                (await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner, offset))

            allListRef.current = allListRef.current.concat(lists)
        }

        loadMore.current = lists.length > 0
        setRefreshing(false)

        // lazy load token info after set loading status to false
        const allRequest = allListRef.current.map(async (nft) => {
            // there's no tokenURI or info already loaded.
            if (!nft.info.tokenURI || !nft.info.loading) return nft
            const info = await getERC721TokenAssetFromChain(nft.info.tokenURI)
            if (info) nft.info = { ...info, ...nft.info, loading: false, name: info.name ?? nft.info.name }
            return nft
        })

        allListRef.current = (await Promise.allSettled(allRequest)).map((x, i) => {
            if (x.status === 'fulfilled') return x.value
            allListRef.current[i].info.loading = false
            return allListRef.current[i]
        })

        return
    }, [GET_ASSETS_URL, contractDetailed, owner, offset, chainId])
    const clearTokenDetailedOwnerList = () => (allListRef.current = [])
    return {
        asyncRetry,
        tokenDetailedOwnerList: allListRef.current,
        loadMore: loadMore.current,
        clearTokenDetailedOwnerList,
        refreshing,
    }
}

async function getERC721TokenDetailedOwnerListFromChain(
    erc721TokenContract: ERC721,
    contractDetailed: ERC721ContractDetailed,
    owner: string,
    offset: number,
) {
    const queryLimit = 10
    const isEnumerable = await safeNonPayableTransactionCall(
        erc721TokenContract.methods.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID),
    )

    const balance = await safeNonPayableTransactionCall(erc721TokenContract.methods.balanceOf(owner))

    if (!isEnumerable || !balance) return []

    const allRequest = Array.from({ length: min([Number(balance), queryLimit])! }).map(async (_v, i) => {
        const tokenId = await safeNonPayableTransactionCall(
            erc721TokenContract.methods.tokenOfOwnerByIndex(owner, i + offset * queryLimit),
        )

        if (!tokenId) {
            return
        }

        return getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
    })

    const tokenDetailedOwnerList = (await Promise.allSettled(allRequest))
        .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        .filter((value) => value) as ERC721TokenDetailed[]

    return tokenDetailedOwnerList
}

export async function getERC721TokenDetailedOwnerListFromOpensea(
    contractDetailed: ERC721ContractDetailed | undefined,
    owner: string,
    apiURL: string,
    offset: number,
    chainId: ChainId,
) {
    const limit = 50
    const detailedURL = urlcat(apiURL, {
        owner,
        asset_contract_address: contractDetailed?.address,
        limit,
        offset: offset * limit,
    })
    const response = await fetch(detailedURL)

    type DataType = {
        image_url: string
        name: string
        token_id: string
        asset_contract: {
            address: string
            name: string
            symbol: string
            image_url: string | null
        }
    }

    if (!response.ok) {
        return []
    }

    const { assets }: { assets: DataType[] } = await response.json()

    return assets.map(
        (asset): ERC721TokenDetailed => ({
            tokenId: asset.token_id,
            contractDetailed: contractDetailed ?? {
                type: EthereumTokenType.ERC721,
                address: asset.asset_contract.address,
                name: asset.asset_contract.name,
                symbol: asset.asset_contract.symbol,
                chainId,
                iconURL: asset.asset_contract.image_url ?? undefined,
            },
            info: {
                name: asset.name,
                image: asset.image_url,
                owner,
            },
        }),
    )
}
