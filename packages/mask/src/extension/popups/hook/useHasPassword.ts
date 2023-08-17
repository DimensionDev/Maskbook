import { useAsyncRetry } from 'react-use'
import { useEffect } from 'react'
import Services from '../../service.js'
import { CrossIsolationMessages } from '@masknet/shared-base'

export function useHasPassword() {
    const { value: hasPassword, loading, retry } = useAsyncRetry(Services.Wallet.hasPassword, [])

    useEffect(() => {
        return CrossIsolationMessages.events.passwordStatusUpdated.on(retry)
    }, [retry])

    return { hasPassword, loading }
}
