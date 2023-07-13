import { useEffect } from 'react'
import { WalletRPC } from '../../../plugins/WalletService/messages.js'
import { useAsyncRetry } from 'react-use'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useContacts() {
    const result = useAsyncRetry(() => WalletRPC.getContacts(), [])
    useEffect(() => {
        return CrossIsolationMessages.events.contactsUpdated.on(result.retry)
    }, [result.retry])
    return result
}
