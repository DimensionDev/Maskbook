import { useAsyncRetry } from 'react-use'
import type { Hub, NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useAccount } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useWeb3Hub<T extends NetworkPluginID, Indicator extends string | number = number>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptions<T, Indicator>,
) {
    type GetHub = (
        options?: Web3Helper.Web3HubOptions<T, Indicator>,
    ) => Promise<
        Hub<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['GasOption'],
            Web3Helper.Definition[T]['Transaction']
        >
    >

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

    return hub
}
