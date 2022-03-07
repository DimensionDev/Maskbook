import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useEffect, useRef, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import {
    useERC721TokenContract,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    getERC721TokenDetailedFromChain,
    safeNonPayableTransactionCall,
    useChainId,
    ChainId,
} from '@masknet/web3-shared-evm'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { NFTScan } from '../'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useERC721TokenDetailedOwnerList(
    contractDetailed: ERC721ContractDetailed | null | undefined,
    owner: string,
) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
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
        const listsFromNFTScan =
            chainId === ChainId.Mainnet ? await getERC721TokenDetailedOwnerListFromNFTScan(contractDetailed, owner) : []
        const lists =
            listsFromNFTScan.length > 0
                ? listsFromNFTScan
                : await getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner)
        allListRef.current = uniqBy<ERC721TokenDetailed>([...allListRef.current, ...lists], 'tokenId')

        setRefreshing(false)
    }, [contractDetailed, owner, chainId])

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

    const allRequest = Array.from({ length: Number.parseInt(balance, 10) }, async (_v, i) => {
        const tokenId = await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenOfOwnerByIndex(owner, i))

        if (!tokenId) return

        return getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId, owner, false)
    })
    return (await Promise.allSettled(allRequest))
        .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        .filter((value) => value) as ERC721TokenDetailed[]
}

async function getERC721TokenDetailedOwnerListFromNFTScan(contractDetailed: ERC721ContractDetailed, owner: string) {
    let allTokenList: ERC721TokenDetailed[] = []
    let _hasNextPage = true
    let page = 0
    while (_hasNextPage) {
        const { data, hasNextPage } = await NFTScan.getTokenDetailedOwnerList(owner, contractDetailed, 100, page)
        page += 1
        _hasNextPage = hasNextPage
        allTokenList = allTokenList.concat(data)
    }
    return uniqBy(allTokenList, 'tokenId')
}
