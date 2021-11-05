import type { Plugin } from '@masknet/plugin-infra'
import { useRef } from 'react'

export interface PluginProviderWatcherProps {
    useNetwork?: () => Plugin.Shared.Network | null
    useProvider?: () => Plugin.Shared.Provider | null
    expectedPluginID: string
    expectedNetworkID: string
}

export function PluginProviderWatcher({ useNetwork, useProvider }: PluginProviderWatcherProps) {
    const network = useRef<() => Plugin.Shared.Network | null>(useNetwork ?? (() => null)).current()
    const provider = useRef<() => Plugin.Shared.Provider | null>(useProvider ?? (() => null)).current()

    console.log('DEBUG: PluginProviderWatcher')
    console.log({
        network,
        provider,
    })

    return null
}
