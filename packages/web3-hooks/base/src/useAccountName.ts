import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'

export function useAccountName<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { Others } = useWeb3State(pluginID)
    const { account, providerType } = useChainContext({ account: expectedAccount })
    const wallets = useWallets(pluginID)

    return useMemo(() => {
        // if the currently selected account is a mask wallet, then use the wallet name as the account name
        const wallet = wallets.find((x) => isSameAddress(account, x.address))
        if (wallet?.name) return wallet.name

        // else use the provider name as the account name
        return Others?.providerResolver.providerName?.(providerType)
    }, [account, providerType, wallets.map((x) => x.address.toLowerCase()), Others])
}
