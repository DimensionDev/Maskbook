import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

export const useUnconfirmedRequest = () => {
    const result = useAsyncRetry(async () => WalletRPC.topUnconfirmedRequest(), [])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
