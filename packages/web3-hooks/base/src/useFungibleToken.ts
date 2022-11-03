import useAsyncRetry from 'react-use/lib/useAsyncRetry.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'
import { attemptUntil } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useChainId } from './useChainId.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    fallbackToken?: Web3Helper.FungibleTokenScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)
    const { Token } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID, options?.chainId)

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!connection) return
        return attemptUntil(
            [
                () => Token?.createFungibleToken?.(chainId, address ?? ''),
                () => connection?.getFungibleToken?.(address ?? '', options),
            ],
            fallbackToken,
        )
    }, [address, connection, chainId, JSON.stringify(options)])
}
