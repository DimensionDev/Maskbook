import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useAccountName<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { account, providerType } = useChainContext<T>({ account: expectedAccount })
    const Others = useWeb3Others(pluginID)
    const wallets = useWallets(pluginID)

    return useMemo(() => {
        // if the currently selected account is a mask wallet, then use the wallet name as the account name
        const wallet = wallets.find((x) => isSameAddress(account, x.address))
        if (wallet?.name) return wallet.name

        // else use the provider name as the account name
        return Others.providerResolver.providerName?.(providerType)
    }, [Others, account, providerType, wallets.map((x) => x.address.toLowerCase())])
}
