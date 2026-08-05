import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { uniqBy } from 'lodash-es'
import { useMemo } from 'react'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

/**
 * Bulletin networks and custom networks.
 * There could be duplicate chian id among them, because that's allow to custom networks.
 */
export function useNetworks<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    uniqChainId?: boolean,
): Array<
    ReasonableNetwork<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['NetworkType']
    >
> {
    const { Network } = useWeb3State(pluginID)
    const networks = useSubscriptionMaybe(Network?.networks, EMPTY_LIST)
    return useMemo(() => {
        // network for Solana is mainnet-beta
        const list = networks.filter((x) => x.network.startsWith('mainnet') || x.isCustomized)
        return uniqChainId ? uniqBy(list, (x) => x.chainId) : list
    }, [networks, uniqChainId, pluginID])
}
