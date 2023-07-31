import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useWalletAutoLockTime() {
    const result = useAsyncRetry(async () => {
        return WalletRPC.getAutoLockerTime()
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.walletLockTimeUpdated.on(result.retry)
    }, [result.retry])

    return result
}
