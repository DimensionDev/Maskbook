import { useWeb3Connection, useWeb3Hub } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'

export function usePermalink(
    account: string,
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
) {
    const connection = useWeb3Connection<'all'>(pluginId, { chainId, account })
    const hub = useWeb3Hub<'all'>(pluginId, { chainId, account })

    return useAsyncRetry(async () => {
        const asset = await hub?.getNonFungibleAsset?.(address, tokenId)
        return asset?.link ?? ''
    }, [pluginId, connection, hub?.getNonFungibleAsset, address, tokenId])
}
