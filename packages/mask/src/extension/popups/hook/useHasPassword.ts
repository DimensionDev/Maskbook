import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import { WalletRPC } from '../../../plugins/WalletService/messages.js'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useHasPassword() {
    const { value: hasPassword, loading, retry } = useAsyncRetry(WalletRPC.hasPassword, [])

    useEffect(() => {
        CrossIsolationMessages.events.hasPaymentPasswordUpdated.on(retry)
    }, [retry])

    return { hasPassword, loading }
}
