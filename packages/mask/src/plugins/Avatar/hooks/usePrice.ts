import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useWeb3Hub } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

export function usePrice(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const hub = useWeb3Hub<'all'>(pluginId, {
        chainId,
        account,
    })

    return useAsyncRetry(async () => {
        if (pluginId !== NetworkPluginID.PLUGIN_EVM || chainId !== ChainId.Mainnet) return '0'
        const asset = await hub?.getNonFungibleAsset?.(address, tokenId, {
            chainId,
            sourceType: SourceType.OpenSea,
        })
        return asset?.price?.[CurrencyType.BTC] ?? '0'
    }, [hub?.getNonFungibleAsset, address, tokenId, chainId])
}
