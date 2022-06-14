import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useProviderReady<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    const { Provider } = useWeb3State(pluginID)

    return useMemo(async () => {
        if (!providerType || !Provider) return false
        return Provider.isReady?.(providerType) ?? false
    }, [providerType, Provider])
}
