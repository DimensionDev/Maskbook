import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWallets } from './useWallets.js'

export function useWallet<T extends NetworkPluginID>(pluginID?: T) {
    const { account } = useChainContext()

    const { value: wallets, loading } = useWallets()

    const wallet = useMemo(() => {
        return account ? wallets?.find((x) => isSameAddress?.(x.address, account)) ?? null : null
    }, [account, wallets?.map((x) => x.address.toLowerCase()).join()])

    return {
        wallet,
        loading,
    }
}
