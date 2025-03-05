import { SimpleHashSupportedChains } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNetworks } from '@masknet/web3-hooks-base'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { CHAIN_DESCRIPTORS, ChainId, type SchemaType, type NetworkType } from '@masknet/web3-shared-evm'
import { sortBy } from 'lodash-es'
import { useMemo } from 'react'

export function useAssetsNetworks(pluginID: NetworkPluginID) {
    const allNetworks = useNetworks(pluginID, true)
    const networks = useMemo(() => {
        const supported = SimpleHashSupportedChains[pluginID]
        const networks = allNetworks.filter(
            (x) => (x.network === 'mainnet' || x.isCustomized) && supported.includes(x.chainId),
        )
        // hard-coded for Zora
        if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            const zora = CHAIN_DESCRIPTORS.find((x) => x.chainId === ChainId.Zora)
            if (zora) networks.push(zora as ReasonableNetwork<ChainId, SchemaType, NetworkType>)
        }
        const list = sortBy(networks, (x) => supported.indexOf(x.chainId))
        return list
    }, [allNetworks, pluginID])

    return networks
}
