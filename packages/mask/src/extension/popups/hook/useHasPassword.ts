import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletRPC } from '../../../plugins/WalletService/messages.js'

export function useHasPassword() {
    const { value: hasPassword, loading, retry } = useAsyncRetry(WalletRPC.hasPassword, [])

    useEffect(() => {
        WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    return { hasPassword, loading }
}
