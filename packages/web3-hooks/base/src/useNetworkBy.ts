import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { EMPTY_STRING, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useNetworks } from './useNetworks.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useNetworkBy<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    chainId?: Web3Helper.ChainIdScope<void, T>,
) {
    const { Network } = useWeb3State(pluginID)
    const networks = useNetworks(pluginID)
    const networkID = useSubscription(Network?.networkID ?? EMPTY_STRING)

    return useMemo(() => {
        if (chainId) return networks.find((x) => x.chainId === chainId)
        return networks.find((x) => x.ID === networkID)
    }, [networks, networkID, chainId])
}
