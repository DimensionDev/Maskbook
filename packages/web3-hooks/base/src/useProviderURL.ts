import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworks } from './useNetworks.js'

export function useProviderURL<T extends NetworkPluginID>(pluginID: T, chainId: Web3Helper.ChainIdScope<void, T>) {
    const networks = useNetworks(pluginID)
    const network = networks.find((x) => x.chainId === chainId)
    return network?.isCustomized ? network.rpcUrl : undefined
}
