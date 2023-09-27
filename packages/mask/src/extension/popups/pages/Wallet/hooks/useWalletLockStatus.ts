import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useWalletLockStatus() {
    const {
        data: isLocked,
        isLoading: loading,
        error,
        refetch,
    } = useQuery(['@@is-locked'], Services.Wallet.isLocked, { networkMode: 'always' })

    useEffect(() => {
        return CrossIsolationMessages.events.walletLockStatusUpdated.on(() => refetch())
    }, [])

    return {
        error,
        loading,
        isLocked,
    }
}
