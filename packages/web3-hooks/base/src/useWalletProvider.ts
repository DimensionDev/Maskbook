import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'

export function useWalletProvider<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    const { Provider } = useWeb3State(pluginID)
    const walletProvider = useMemo(() => {
        if (!providerType) return
        return Provider?.getWalletProvider?.(providerType)
    }, [providerType, Provider])

    return walletProvider as Web3Helper.WalletProviderScope<S, T> | null
}
