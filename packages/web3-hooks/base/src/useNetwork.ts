import { useDebugValue, useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_STRING, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useNetworks } from './useNetworks.js'

export function useNetwork<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    chainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { Network } = useWeb3State(pluginID)
    const networks = useNetworks(pluginID)
    const networkID = useSubscription(Network?.networkID ?? EMPTY_STRING)

    const network = useMemo(() => {
        if (chainId) return networks.find((x) => x.chainId === chainId)
        return networks.find((x) => x.ID === networkID)
    }, [chainId, networkID, networks])
    useDebugValue(network)
    return network
}
