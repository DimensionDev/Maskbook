import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useAccount } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useWeb3Hub<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator = number,
>(pluginID?: T, options?: Web3Helper.Web3HubOptionsScope<S, T, Indicator>) {
    const { Hub } = useWeb3State(pluginID)
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)

    const { value: hub = null } = useAsyncRetry(async () => {
        return Hub?.getHub?.({
            account,
            chainId,
            ...options,
        } as Web3Helper.Web3HubOptionsScope<S, T>)
    }, [account, chainId, Hub, JSON.stringify(options)])

    return hub as Web3Helper.Web3HubScope<S, T>
}
