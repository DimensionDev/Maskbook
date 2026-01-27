import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'

/**
 * Use the currently selected wallet.
 * @param pluginID
 * @returns
 */
export function useWallet(address?: string) {
    const { account } = useChainContext()
    const wallets = useWallets()

    const target = address ?? account
    return useMemo(() => {
        return target ? (wallets.find((x) => isSameAddress(x.address, target)) ?? null) : null
    }, [target, wallets])
}
