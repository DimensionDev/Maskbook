import { useAsyncRetry } from 'react-use'
import { EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useNonFungibleAssets } from '@masknet/web3-hooks-base'
import { isSameAddress, type NonFungibleToken } from '@masknet/web3-shared-base'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useNonFungibleOwnerTokens(
    contractAddress: string,
    ownerAccount: string,
    chainId: ChainId,
    _balance?: number,
) {
    const { data: collectibles_ } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account: ownerAccount,
    })

    const collectibles = collectibles_
        ?.filter((x) => isSameAddress(contractAddress, x.address))
        .map((x) => ({ ...x, ownerId: x.owner?.address })) as Array<NonFungibleToken<ChainId, SchemaType.ERC721>>

    return useAsyncRetry(async () => {
        if (collectibles.length > 0) return collectibles
        if (!contractAddress || !ownerAccount) return

        const contract = EVMContract.getERC721Contract(contractAddress, { chainId })
        if (!contract) return

        const isEnumerable = await contract.methods.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID).call()

        const balance =
            _balance === undefined ?
                Number.parseInt(await contract.methods.balanceOf(ownerAccount).call(), 10)
            :   _balance

        if (!isEnumerable || !balance) return

        const allRequest = Array.from({ length: balance }, async (_v, i) => {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(ownerAccount, i).call()

            if (!tokenId) return

            return [contractAddress, tokenId] as [string, string]
        })

        const listOfPairs = (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter(Boolean) as Array<[string, string]>

        if (!listOfPairs.length) return

        return Promise.all(
            listOfPairs.map((x) =>
                EVMWeb3.getNonFungibleToken(x[0], x[1], SchemaType.ERC721, {
                    chainId,
                    account: ownerAccount,
                }),
            ) ?? [],
        ) as Promise<Array<NonFungibleToken<ChainId, SchemaType.ERC721>>>
    }, [chainId, contractAddress, ownerAccount, _balance, JSON.stringify(collectibles)])
}
