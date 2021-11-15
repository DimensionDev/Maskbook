import type { Web3Plugin } from '@masknet/plugin-infra'
import { useEffect } from 'react'
import { networkIDSettings, pluginIDSettings } from '../../../../settings/settings'

export interface PluginNetworkWatcherProps {
    network?: Web3Plugin.NetworkDescriptor
    expectedPluginID: string
    expectedNetworkID: string
}

export function PluginNetworkWatcher({ network, expectedPluginID, expectedNetworkID }: PluginNetworkWatcherProps) {
    useEffect(() => {
        const matched =
            network && network.networkSupporterPluginID === expectedPluginID && network.ID === expectedNetworkID
        if (!matched) return
        pluginIDSettings.value = expectedPluginID
        networkIDSettings.value = expectedNetworkID
    }, [network, expectedPluginID, expectedNetworkID])
    return null
}
