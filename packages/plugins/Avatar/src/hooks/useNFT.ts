import { useAsyncRetry } from 'react-use'
import { ChainId } from '@masknet/web3-shared-evm'
import { useWeb3Connection, useWeb3Hub, useWeb3Others } from '@masknet/web3-hooks-base'
import { formatBalance, CurrencyType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NFTInfo } from '../types.js'

export function useNFT(
    account: string,
    address?: string,
    tokenId?: string,
    pluginID: NetworkPluginID = NetworkPluginID.PLUGIN_EVM,
    chainId: ChainId = ChainId.Mainnet,
    ownerAddress?: string,
) {
    const hub = useWeb3Hub(pluginID, {
        chainId,
        account,
    })
    const Others = useWeb3Others(pluginID)
    const Web3 = useWeb3Connection(pluginID, {
        chainId,
        account,
    })
    const Hub = useWeb3Hub(pluginID)
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        const allSettled = await Promise.allSettled([
            Web3.getNonFungibleToken(address, tokenId),
            Hub.getNonFungibleAsset(address, tokenId, {
                chainId,
                account: ownerAddress,
            }),
        ])

        const [token, asset] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
            Web3Helper.NonFungibleTokenAll | undefined,
            Web3Helper.NonFungibleAssetAll | undefined,
        ]

        const metadata = asset?.metadata || token?.metadata
        const amount = asset?.priceInToken
            ? formatBalance(asset.priceInToken.amount, asset.priceInToken.token.decimals)
            : asset?.price?.[CurrencyType.USD] ?? '0'
        const name = metadata?.name ?? ''
        const imageURL = metadata?.imageURL
        const permalink = asset?.link ?? Others.explorerResolver.nonFungibleTokenLink(chainId, address, tokenId)

        return {
            amount,
            name,
            symbol: asset?.priceInToken ? asset.priceInToken.token.symbol : 'USD',
            image: imageURL,
            owner: token?.ownerId ?? asset?.owner?.address ?? asset?.ownerId,
            // Not all NFT markets have slug in the URL
            slug: token ? undefined : asset?.collection?.slug,
            permalink,
            tokenId,
        } as NFTInfo
    }, [Web3, Hub, Others, address, tokenId, chainId, ownerAddress])
}
