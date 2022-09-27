import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Hub, useWeb3State } from '@masknet/plugin-infra/web3'
import {
    formatBalance,
    CurrencyType,
    NetworkPluginID,
    NonFungibleToken,
    NonFungibleAsset,
} from '@masknet/web3-shared-base'
import type { NFTInfo } from '../types.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useNFT(
    account: string,
    address?: string,
    tokenId?: string,
    pluginId: NetworkPluginID = NetworkPluginID.PLUGIN_EVM,
    chainId: ChainId = ChainId.Mainnet,
    onwerAddress?: string,
) {
    const { Others, Connection } = useWeb3State<'all'>(pluginId ?? NetworkPluginID.PLUGIN_EVM)
    const hub = useWeb3Hub<'all'>(pluginId, {
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
                account: onwerAddress,
            }),
        ])

        const [token, asset] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
            NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | undefined,
            NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | undefined,
        ]

        const contract = token?.contract || asset?.contract
        const metadata = token?.metadata || asset?.metadata

        const amount = asset?.priceInToken
            ? formatBalance(asset.priceInToken.amount, asset.priceInToken.token.decimals)
            : asset?.price?.[CurrencyType.USD] ?? '0'
        const name = contract?.name || metadata?.name || ''
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
    }, [hub?.getNonFungibleAsset, Connection?.getConnection, address, tokenId, Others, chainId, onwerAddress])
}
