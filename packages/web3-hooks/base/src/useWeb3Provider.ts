import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useWeb3Provider<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { Connection } = useWeb3State(pluginID)
    const { account, chainId, providerType } = useChainContext()

    const { value: web3Provider = null } = useAsyncRetry(async () => {
        return Connection?.getWeb3Provider?.({
            account,
            chainId,
            providerType,
            ...options,
        })
    }, [account, chainId, providerType, Connection, JSON.stringify(options)])

    return web3Provider as Web3Helper.Web3ProviderScope<S, T> | null
}
