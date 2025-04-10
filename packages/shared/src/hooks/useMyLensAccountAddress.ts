import type { EvmAddress } from '@lens-protocol/client'
import { PersistentStorages, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useAvailableLensAccounts } from './useAvailableLensAccounts.js'

export function useMyLensAccountAddress(): EvmAddress | undefined {
    const { account: walletAccount } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const lastLensAccount = useSubscription(PersistentStorages.Settings.storage.lastLensAccount.subscription)
    const { data: lensAccounts } = useAvailableLensAccounts()

    return useMemo(() => {
        if (!walletAccount) return
        // Make sure lastLensAccount is in lensAccounts
        return lensAccounts?.find((x) => isSameAddress(x.account.address, lastLensAccount))?.account.address
    }, [walletAccount, lastLensAccount, lensAccounts])
}

export function setMyLensAccountAddress(address: string) {
    PersistentStorages.Settings.storage.lastLensAccount.setValue(address)
}
