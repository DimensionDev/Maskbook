import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from '../entry-web3'
import { useWeb3Hub } from './useWeb3Hub'
import { ChainId } from '@masknet/web3-shared-evm'

export function useNonFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry<Web3Helper.NonFungibleAssetScope<S, T> | undefined>(async () => {
        if (!address || !id || !hub) return
        // FIXME: no fixed chain id
        return hub.getNonFungibleAsset?.(address, id, { chainId: ChainId.Mainnet })
    }, [address, id, hub])
}
