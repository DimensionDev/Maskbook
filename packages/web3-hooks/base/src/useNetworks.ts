import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { uniqBy } from 'lodash-es'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useWeb3State } from './useWeb3State.js'

/**
 * Bulletin networks and custom networks.
 * There could be duplicate chian id among them, because that's allow to custom networks.
 */
export function useNetworks<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, uniqChainId?: boolean) {
    const { Network } = useWeb3State(pluginID)
    const networks = useSubscription(Network?.networks ?? EMPTY_ARRAY)
    return useMemo(() => {
        const list = networks.filter((x) => x.network === 'mainnet' || x.isCustomized)
        return uniqChainId ? uniqBy(list, (x) => x.chainId) : list
    }, [networks, uniqChainId])
}
