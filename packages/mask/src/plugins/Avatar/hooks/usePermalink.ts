import { useWeb3Hub, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'

export function usePermalink(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const hub = useWeb3Hub<'all'>(pluginId, { chainId, account })
    const { Others } = useWeb3State<'all'>(pluginId ?? NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        const asset = await hub?.getNonFungibleAsset?.(address, tokenId)
        return (
            asset?.link ??
            Others?.explorerResolver.nonFungibleTokenLink(chainId ?? ChainId.Mainnet, address ?? '', tokenId ?? '')
        )
    }, [pluginId, hub?.getNonFungibleAsset, address, tokenId, Others, chainId])
}
