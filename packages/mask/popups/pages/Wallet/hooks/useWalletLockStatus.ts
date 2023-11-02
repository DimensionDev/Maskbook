import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useWalletLockStatus() {
    const {
        data: isLocked,
        isLoading,
        error,
        refetch,
    } = useQuery(['@@is-locked'], Services.Wallet.isLocked, { networkMode: 'always' })

    useEffect(() => {
        refetch()
        return CrossIsolationMessages.events.walletLockStatusUpdated.on(() => refetch())
    }, [])

    return {
        error,
        isLoading,
        isLocked,
    }
}
