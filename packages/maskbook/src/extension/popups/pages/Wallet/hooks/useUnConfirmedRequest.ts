import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

export const useUnconfirmedRequest = () => {
    const result = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return
        const computedPayload = await WalletRPC.getComputedPayload(payload)
        return {
            payload,
            computedPayload,
        }
    }, [])

    useEffect(() => {
        return WalletMessages.events.unconfirmedRequestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
