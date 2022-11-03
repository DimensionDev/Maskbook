import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'
import { useChainContext } from './useContext.js'

export function useWeb3Hub<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { Hub } = useWeb3State(pluginID)
    const { account, chainId } = useChainContext()

    const { value: hub = null } = useAsyncRetry(async () => {
        return Hub?.getHub?.({
            account,
            chainId,
            ...options,
        })
    }, [account, chainId, Hub?.getHub, JSON.stringify(options)])

    return hub as Web3Helper.Web3HubScope<S, T> | null
}
