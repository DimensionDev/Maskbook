import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'

/**
 * Use the currently selected wallet.
 * @param pluginID
 * @returns
 */
export function useWallet() {
    const { account } = useChainContext()
    const wallets = useWallets()

    return useMemo(() => {
        return account ? (wallets.find((x) => isSameAddress(x.address, account)) ?? null) : null
    }, [account, wallets])
}
