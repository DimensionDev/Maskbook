import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { EMPTY_STRING, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useNetworks } from './useNetworks.js'

export function useNetwork<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { Network } = useWeb3State(pluginID)
    const networks = useNetworks(pluginID)
    const networkID = useSubscription(Network?.networkID ?? EMPTY_STRING)

    return useMemo(() => {
        return networks.find((x) => x.ID === networkID)
    }, [networks, networkID])
}
