import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useWalletAutoLockTime() {
    const result = useAsyncRetry(async () => {
        return Services.Wallet.getAutoLockerDuration()
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.walletLockTimeUpdated.on(result.retry)
    }, [result.retry])

    return result
}
