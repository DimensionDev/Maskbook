import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useAccount } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useWeb3Hub<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator extends string | Record<string, string | undefined> | number = number,
>(pluginID?: T, options?: Web3Helper.Web3HubOptions<T, Indicator>) {
    type Result = S extends 'all' ? Web3Helper.Web3HubAll : Web3Helper.Web3Hub<T>
    type GetHub = (options?: Web3Helper.Web3HubOptions<T, Indicator>) => Promise<Web3Helper.Web3HubAll>

    const { Hub } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)

    const { value: hub = null } = useAsyncRetry(async () => {
        if (!Hub?.getHub) return
        return (Hub.getHub as GetHub)?.({
            account,
            chainId,
            ...options,
        } as Web3Helper.Web3HubOptions<T, Indicator>)
    }, [account, chainId, Hub, JSON.stringify(options)])

    return hub as Result
}
