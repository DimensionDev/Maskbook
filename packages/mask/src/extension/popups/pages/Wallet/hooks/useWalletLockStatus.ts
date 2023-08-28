import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import Services from '../../../../service.js'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useWalletLockStatus() {
    const {
        value: isLocked,
        loading,
        error,
        retry,
    } = useAsyncRetry(async () => {
        return Services.Wallet.isLocked()
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    return {
        error,
        loading,
        isLocked,
    }
}
