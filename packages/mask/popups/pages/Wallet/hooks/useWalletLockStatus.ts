import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useWalletLockStatus() {
    const {
        data: isLocked,
        isPending,
        error,
        refetch,
    } = useQuery({ queryKey: ['@@is-locked'], queryFn: Services.Wallet.isLocked, networkMode: 'always' })

    useEffect(() => {
        refetch()
        return CrossIsolationMessages.events.walletLockStatusUpdated.on(() => refetch())
    }, [])

    return {
        error,
        isPending,
        isLocked,
    }
}
