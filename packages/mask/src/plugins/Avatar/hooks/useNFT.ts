import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Hub, useWeb3State } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { NFTInfo } from '../types'

export function useNFT(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const { Others } = useWeb3State<'all'>(pluginId ?? NetworkPluginID.PLUGIN_EVM)
    const hub = useWeb3Hub<'all'>(pluginId, {
        chainId,
        account,
    })

    return useAsyncRetry(async () => {
        const asset = await hub?.getNonFungibleAsset?.(address, tokenId, {
            chainId,
        })
        console.log(asset)
        return {
            amount: asset?.price?.[CurrencyType.USD] ?? '0',
            name: asset?.contract?.name ?? '',
            symbol: asset?.payment_tokens?.[0].symbol ?? 'ETH',
            image: asset?.metadata?.imageURL ?? '',
            owner: asset?.owner?.address ?? asset?.ownerId ?? '',
            slug: asset?.collection?.slug ?? '',
            permalink:
                asset?.link ??
                Others?.explorerResolver.nonFungibleTokenLink(chainId ?? ChainId.Mainnet, address, tokenId) ??
                '',
        } as NFTInfo
    }, [hub?.getNonFungibleAsset, address, tokenId, Others, chainId])
}
