import { useDebugValue, useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useNetworks } from './useNetworks.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'

export function useNetwork<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    chainId?: Web3Helper.Definition[T]['ChainId'],
):
    | ReasonableNetwork<
          Web3Helper.Definition[T]['ChainId'],
          Web3Helper.Definition[T]['SchemaType'],
          Web3Helper.Definition[T]['NetworkType']
      >
    | undefined {
    const { Network } = useWeb3State(pluginID)
    const networks = useNetworks(pluginID)
    const networkID = useSubscriptionMaybe(Network?.networkID, '')

    const network = useMemo(() => {
        if (chainId) return networks.find((x) => x.chainId === chainId)
        return networks.find((x) => x.ID === networkID)
    }, [chainId, networkID, networks])
    useDebugValue(network)
    return network
}
