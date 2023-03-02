import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { isSameAddress, type NonFungibleToken } from '@masknet/web3-shared-base'
import { useWeb3Connection, useNonFungibleAssets } from '@masknet/web3-hooks-base'

import { useERC721TokenContract } from './useERC721TokenContract.js'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useNonFungibleOwnerTokens(
    contractAddress: string,
    ownerAccount: string,
    chainId: ChainId,
    _balance?: number,
) {
    const nonFungibleTokenContract = useERC721TokenContract(chainId, contractAddress ?? '')
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { value: collectibles_ = EMPTY_LIST, done: loadFinish } = useNonFungibleAssets(
        NetworkPluginID.PLUGIN_EVM,
        SchemaType.ERC721,
        { chainId, account: ownerAccount },
    )

    const collectibles = collectibles_
        ?.filter((x) => isSameAddress(contractAddress, x.address))
        .map((x) => ({ ...x, ownerId: x.owner?.address })) as Array<NonFungibleToken<ChainId, SchemaType.ERC721>>

    return useAsyncRetry(async () => {
        if (collectibles.length > 0) return collectibles
        if (!contractAddress || !ownerAccount || !connection || !nonFungibleTokenContract) {
            return
        }

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

        return Promise.all(
            listOfPairs?.map((x) =>
                connection.getNonFungibleToken(x[0], x[1], SchemaType.ERC721, {
                    chainId,
                    account: ownerAccount,
                }),
            ) ?? [],
        ) as Promise<Array<NonFungibleToken<ChainId, SchemaType.ERC721>>>
    }, [
        chainId,
        contractAddress,
        ownerAccount,
        connection,
        nonFungibleTokenContract,
        _balance,
        JSON.stringify(collectibles),
    ])
}
