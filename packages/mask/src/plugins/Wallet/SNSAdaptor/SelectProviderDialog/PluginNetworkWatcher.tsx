import type { Plugin } from '@masknet/plugin-infra'
import { useEffect } from 'react'
import { networkIDSettings, pluginIDSettings } from '../../../../settings/settings'

export interface PluginNetworkWatcherProps {
    useNetwork: () => Plugin.Shared.Network | null
    expectedPluginID: string
    expectedNetworkID: string
}

export function PluginNetworkWatcher({ useNetwork, expectedPluginID, expectedNetworkID }: PluginNetworkWatcherProps) {
    const network = useNetwork()

    useEffect(() => {
        const matched = network && network.pluginID === expectedPluginID && network.ID === expectedNetworkID
        if (!matched) return
        pluginIDSettings.value = expectedPluginID
        networkIDSettings.value = expectedNetworkID
    }, [network, expectedPluginID, expectedNetworkID])
    return null
}
