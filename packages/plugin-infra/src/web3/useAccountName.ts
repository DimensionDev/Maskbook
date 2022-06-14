import { useMemo } from 'react'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'
import { useWallets } from './useWallets'
import { useProviderType } from './useProviderType'

export function useAccountName<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { Others } = useWeb3State(pluginID)
    const account = useAccount(pluginID, expectedAccount)
    const providerType = useProviderType(pluginID)
    const wallets = useWallets(pluginID)

    return useMemo(() => {
        // if the currently selected account is a mask wallet, then use the wallet name as the account name
        const wallet = wallets.find((x) => isSameAddress(account, x.address))
        if (wallet?.name) return wallet.name

        // else use the provider name as the account name
        return Others?.providerResolver.providerName?.(providerType)
    }, [account, providerType, wallets.map((x) => x.address.toLowerCase()), Others])
}
