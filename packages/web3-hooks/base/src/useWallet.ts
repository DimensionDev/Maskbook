import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'

/**
 * Use the currently selected wallet.
 * @param pluginID
 * @returns
 */
export function useWallet<T extends NetworkPluginID>(
    pluginID?: T,
    providerType?: Web3Helper.Definition[T]['ProviderType'],
) {
    const { account } = useChainContext()
    const wallets = useWallets()

    return useMemo(() => {
        return account ? wallets.find((x) => isSameAddress?.(x.address, account)) ?? null : null
    }, [account, wallets])
}
