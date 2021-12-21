import { useEffect, useState } from 'react'
import { MiniNetworkSelector } from '@masknet/shared'
import { getRegisteredWeb3Networks, useNetworkDescriptor, usePluginIDContext, Web3Plugin } from '@masknet/plugin-infra'

export interface NetworkSelectorProps {
    onSelectNetwork(network: Web3Plugin.NetworkDescriptor | null): void
}

export function NetworkSelector({ onSelectNetwork }: NetworkSelectorProps) {
    const pluginId = usePluginIDContext()
    const networks = getRegisteredWeb3Networks()
    const networkDescriptor = useNetworkDescriptor()
    const [selectedNetwork, setSelectedNetwork] = useState<Web3Plugin.NetworkDescriptor | null>(
        networkDescriptor ?? null,
    )

    const [renderNetworks, setRenderNetworks] = useState<Web3Plugin.NetworkDescriptor[]>([])

    const onSelect = (network: Web3Plugin.NetworkDescriptor | null) => {
        setSelectedNetwork(network)
        onSelectNetwork(network)
    }

    useEffect(() => {
        setRenderNetworks(networks.filter((x) => pluginId === x.networkSupporterPluginID && x.isMainnet))
    }, [pluginId])

    return (
        <MiniNetworkSelector
            size={24}
            hideAllNetworkButton
            selectedNetwork={selectedNetwork}
            networks={renderNetworks}
            onSelect={onSelect}
        />
    )
}
