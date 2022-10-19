import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Hub, useWeb3State } from '@masknet/web3-hooks-base'
import { formatBalance, CurrencyType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NFTInfo } from '../types.js'

export function useNFT(
    pluginID: NetworkPluginID = NetworkPluginID.PLUGIN_EVM,
    account: string,
    address?: string,
    tokenId?: string,
    chainId: ChainId = ChainId.Mainnet,
    ownerAddress?: string,
) {
    const { Others, Connection } = useWeb3State<'all'>(pluginID)
    const hub = useWeb3Hub<'all'>(pluginID, {
        chainId,
        account,
    })
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        const connection = await Connection?.getConnection?.({
            chainId,
            account,
        })
        const allSettled = await Promise.allSettled([
            connection?.getNonFungibleToken(address, tokenId),
            hub?.getNonFungibleAsset?.(address, tokenId, {
                chainId,
                account: ownerAddress,
            }),
        ])

        const [token, asset] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
            Web3Helper.NonFungibleTokenScope<'all'> | undefined,
            Web3Helper.NonFungibleAssetScope<'all'> | undefined,
        ]

        const metadata = asset?.metadata || token?.metadata
        const amount = asset?.priceInToken
            ? formatBalance(asset.priceInToken.amount, asset.priceInToken.token.decimals)
            : asset?.price?.[CurrencyType.USD] ?? '0'
        const name = metadata?.name ?? ''
        const imageURL = metadata?.imageURL
        const permalink = asset?.link ?? Others?.explorerResolver.nonFungibleTokenLink(chainId, address, tokenId)

        return {
            amount,
            name,
            symbol: asset?.priceInToken ? asset.priceInToken.token.symbol : 'USD',
            image: imageURL,
            owner: token?.ownerId ?? asset?.owner?.address ?? asset?.ownerId,
            // Not all NFT markets have slug in the URL
            slug: token ? undefined : asset?.collection?.slug,
            permalink,
        } as NFTInfo
    }, [hub?.getNonFungibleAsset, Connection?.getConnection, address, tokenId, Others, chainId, ownerAddress])
}
