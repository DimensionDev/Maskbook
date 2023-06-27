import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useEffect } from 'react'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'

export function useWalletLockStatus() {
    const {
        value: isLocked,
        loading,
        error,
        retry,
    } = useAsyncRetry(async () => {
        return WalletRPC.isLocked()
    }, [])

    useEffect(() => {
        return WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    return {
        error,
        loading,
        isLocked,
    }
}
