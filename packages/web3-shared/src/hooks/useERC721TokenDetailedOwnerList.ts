import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useOpenseaAPIConstants } from '../constants'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { safeNonPayableTransactionCall } from '../utils'
import type { ERC721ContractDetailed, ERC721TokenDetailed } from '../types'
import { getERC721TokenDetailedFromChain } from './useERC721TokenDetailed'
import { useRef } from 'react'
import { min } from 'lodash-es'
import urlcat from 'urlcat'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useERC721TokenDetailedOwnerList(
    contractDetailed: ERC721ContractDetailed | undefined,
    owner: string,
    offset: number,
) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    const allListRef = useRef<ERC721TokenDetailed[]>([])
    const asyncRetry = useAsyncRetry(async () => {
        if (
            !erc721TokenContract ||
            !contractDetailed?.address ||
            !EthereumAddress.isValid(contractDetailed?.address) ||
            !owner
        )
            return

        let lists: ERC721TokenDetailed[]

        if (!GET_ASSETS_URL) {
            lists = await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner, offset)
            allListRef.current = allListRef.current.concat(lists)
            return { tokenDetailedOwnerList: allListRef.current, loadMore: lists.length > 0 }
        }

        const tokenDetailedOwnerListFromOpensea = await getERC721TokenDetailedOwnerListFromOpensea(
            contractDetailed,
            owner,
            GET_ASSETS_URL,
            offset,
        )

        lists =
            tokenDetailedOwnerListFromOpensea ??
            (await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner, offset))

        allListRef.current = allListRef.current.concat(lists)

        return { tokenDetailedOwnerList: allListRef.current, loadMore: lists.length > 0 }
    }, [GET_ASSETS_URL, contractDetailed, owner, offset])
    const clearTokenDetailedOwnerList = () => (allListRef.current = [])
    return { asyncRetry, clearTokenDetailedOwnerList }
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

        if (tokenId) {
            const tokenDetailed = await getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
            return tokenDetailed
        }

        return
    })

    const tokenDetailedOwnerList = (await Promise.allSettled(allRequest))
        .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        .filter((value) => value) as ERC721TokenDetailed[]

    return tokenDetailedOwnerList
}

async function getERC721TokenDetailedOwnerListFromOpensea(
    contractDetailed: ERC721ContractDetailed,
    owner: string,
    apiURL: string,
    offset: number,
) {
    const limit = 50
    const response = await fetch(
        urlcat(apiURL, {
            owner,
            asset_contract_address: contractDetailed.address,
            limit,
            offset: offset * limit,
        }),
    )
    type DataType = {
        image_url: string
        name: string
        token_id: string
    }
    if (response.ok) {
        const { assets }: { assets: DataType[] } = await response.json()

        return assets.map(
            (asset): ERC721TokenDetailed => ({
                tokenId: asset.token_id,
                contractDetailed,
                info: {
                    name: asset.name,
                    image: asset.image_url,
                    owner,
                },
            }),
        )
    }
    return []
}
