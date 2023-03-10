import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { WalletAPI } from '@masknet/web3-providers/types'
import { useWeb3State } from './useWeb3State.js'

export function useWalletProvider<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    type WalletProvider = WalletAPI.Provider<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Web3Provider'],
        Web3Helper.Definition[T]['Web3']
    >

    const { Provider } = useWeb3State(pluginID)
    const walletProvider = useMemo(() => {
        if (!providerType) return
        return Provider?.getWalletProvider?.(providerType) as WalletProvider | undefined
    }, [providerType, Provider])

    return walletProvider || null
}
