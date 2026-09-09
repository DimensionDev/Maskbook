import { NetworkPluginID } from '@masknet/shared-base'
import { useNetworks } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { RED_PACKET_UNSUPPORTED_CHAINS } from '../../constants.js'

/** Chain ids offered in the red packet token pickers. */
export function useRedPacketSupportedChains(): ChainId[] {
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    return useMemo(
        () =>
            networks
                .map((network) => network.chainId)
                .filter((chainId) => !RED_PACKET_UNSUPPORTED_CHAINS.includes(chainId)),
        [networks],
    )
}
