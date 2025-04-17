import type { EvmAddress } from '@lens-protocol/client'
import { PersistentStorages } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useAvailableLensAccounts } from './useAvailableLensAccounts.js'
import { first } from 'lodash-es'

export function useMyLensAccountAddress(isManaged?: boolean): EvmAddress | undefined {
    const lastLensAccount = useSubscription(PersistentStorages.Settings.storage.lastLensAccount.subscription)
    const { data: lensAccounts } = useAvailableLensAccounts(isManaged)

    return useMemo(() => {
        if (!lensAccounts?.length) return
        // Make sure lastLensAccount is in lensAccounts
        const lensAccount =
            lastLensAccount ?
                lensAccounts.find((x) => isSameAddress(x.account.address, lastLensAccount))
            :   first(lensAccounts)
        return lensAccount?.account.address
    }, [lastLensAccount, lensAccounts])
}

export function setMyLensAccountAddress(address: string) {
    PersistentStorages.Settings.storage.lastLensAccount.setValue(address)
}
