import { first } from 'lodash-es'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getRPCConstants } from '@masknet/web3-shared-evm'
import { useChainId } from './useChainId.js'
import { useNetworkContext } from './useContext.js'

export function useWeb3ProviderURL<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { pluginID: resolvePluginID } = useNetworkContext(pluginID)
    const chainId = useChainId(resolvePluginID, expectedChainId)

    // only EVM is available
    if (resolvePluginID !== NetworkPluginID.PLUGIN_EVM) return

    const { RPC_URLS, RPC_URLS_OFFICIAL } = getRPCConstants(chainId)
    return first(RPC_URLS) ?? first(RPC_URLS_OFFICIAL)
}
