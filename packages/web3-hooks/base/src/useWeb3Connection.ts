import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useProviderType } from './useProviderType.js'
import { useWeb3State } from './useWeb3State.js'

export function useWeb3Connection<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { Connection } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)
    const providerType = useProviderType(pluginID)

    const { value: connection = null } = useAsyncRetry(async () => {
        return Connection?.getConnection?.({
            account,
            chainId,
            providerType,
            ...options,
        })
    }, [account, chainId, providerType, Connection, JSON.stringify(options)])

    return connection as Web3Helper.Web3ConnectionScope<S, T> | null
}
