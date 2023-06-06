import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'

export function useProviderReady<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    const { Provider } = useWeb3State(pluginID)

    return useMemo(async () => {
        if (!providerType || !Provider) return false
        return Provider.isReady(providerType) ?? false
    }, [providerType, Provider])
}
