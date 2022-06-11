import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Connection, useWeb3Hub } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'

export function useNFT(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const connection = useWeb3Connection<'all'>(pluginId, { chainId, account })
    const hub = useWeb3Hub<'all'>(pluginId, { chainId, account })

    return useAsyncRetry(async () => {
        const asset = await hub.getNonFungibleAsset?.(address, tokenId)
        if (asset) {
            return {
                amount: asset.price?.[CurrencyType.NATIVE] ?? '0',
                name: asset.contract?.name ?? '',
                symbol: asset.contract?.symbol ?? 'ETH',
                image: asset.metadata?.imageURL ?? '',
                owner: asset.ownerId ?? '',
                slug: asset.collection?.slug ?? '',
            }
        }

        const nft = await connection?.getNonFungibleToken(address, tokenId)
        return {
            amount: '0',
            name: nft?.contract?.name ?? '',
            symbol: nft?.contract?.symbol ?? 'ETH',
            image: nft?.metadata?.imageURL ?? '',
            owner: nft?.ownerId ?? '',
            slug: '',
        }
    }, [pluginId, connection, hub, address, tokenId])
}
