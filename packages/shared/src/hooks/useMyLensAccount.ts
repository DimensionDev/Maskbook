import { type NetworkPluginID, PersistentStorages } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useAvailableLensAccounts } from './useAvailableLensAccounts.js'
import { first } from 'lodash-es'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useMyLensAccount() {
    const { account: walletAccount } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const lastLensAccountMap = useSubscription(PersistentStorages.Settings.storage.lastLensAccountMap.subscription)
    const { data: lensAccounts } = useAvailableLensAccounts()

    const lastLensAccount = lastLensAccountMap[walletAccount.toLowerCase()]
    return useMemo(() => {
        if (!lensAccounts?.length) return
        // Make sure lastLensAccount is in lensAccounts
        const lensAccount =
            lastLensAccount ?
                lensAccounts.find((x) => isSameAddress(x.account.address, lastLensAccount))
            :   first(lensAccounts)
        return lensAccount
    }, [lastLensAccount, lensAccounts])
}

export function setMyLensAccountAddress(walletAddress: string, address: string) {
    const prev = PersistentStorages.Settings.storage.lastLensAccountMap.value
    const key = walletAddress.toLowerCase()
    if (isSameAddress(prev[key], address)) return

    PersistentStorages.Settings.storage.lastLensAccountMap.setValue({
        ...prev,
        [walletAddress.toLowerCase()]: address,
    })
}
