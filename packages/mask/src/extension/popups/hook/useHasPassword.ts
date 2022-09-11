import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../plugins/Wallet/messages.js'
import { useEffect } from 'react'
import { WalletMessages } from '@masknet/plugin-wallet'

export function useHasPassword() {
    const { value: hasPassword, loading, retry } = useAsyncRetry(WalletRPC.hasPassword, [])

    useEffect(() => {
        WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    return { hasPassword, loading }
}
