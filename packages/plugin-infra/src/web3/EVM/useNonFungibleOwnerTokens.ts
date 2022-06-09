import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useRef } from 'react'
import { NonFungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Connection } from '../useWeb3Connection'

import { useERC721TokenContract } from './useERC721TokenContract'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useNonFungibleOwnerTokens(
    contractAddress: string,
    ownerAccount: string,
    chainId: ChainId,
    _balance?: number,
) {
    const allListRef = useRef<Array<NonFungibleToken<ChainId, SchemaType.ERC721>>>([])
    const nonFungibleTokenContract = useERC721TokenContract(chainId, contractAddress ?? '')
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const asyncRetry = useAsyncRetry(async () => {
        if (!contractAddress || !ownerAccount || !connection || !nonFungibleTokenContract) return

        const isEnumerable = await nonFungibleTokenContract.methods
            .supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)
            .call()

        const balance =
            _balance === undefined
                ? Number.parseInt(await nonFungibleTokenContract.methods.balanceOf(ownerAccount).call(), 10)
                : _balance

        if (!isEnumerable || !balance) return

        const allRequest = Array.from({ length: balance }, async (_v, i) => {
            const tokenId = await nonFungibleTokenContract.methods.tokenOfOwnerByIndex(ownerAccount, i).call()

            if (!tokenId) return

            return [contractAddress, tokenId] as [string, string]
        })

        const listOfPairs = (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((value) => value) as Array<[string, string]>

        if (!listOfPairs.length) return

        allListRef.current = (
            await Promise.all(
                listOfPairs?.map((x) =>
                    connection.getNonFungibleToken(x[0], x[1], {
                        account: ownerAccount,
                    }),
                ) ?? [],
            )
        ).filter((x) => x.contract?.balance) as Array<NonFungibleToken<ChainId, SchemaType.ERC721>>
    }, [contractAddress, ownerAccount, chainId, connection, nonFungibleTokenContract, _balance])

    const clearTokenDetailedOwnerList = () => (allListRef.current = [])

    return {
        asyncRetry,
        tokenDetailedOwnerList: allListRef.current,
        clearTokenDetailedOwnerList,
    }
}
