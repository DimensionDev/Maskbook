import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { useEffect } from 'react'
import { WalletMessages } from '@masknet/plugin-wallet'

export const useUnconfirmedRequest = () => {
    const result = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return
        const computedPayload = await Services.Ethereum.getComputedPayload(payload)
        return {
            payload,
            computedPayload,
        }
    }, [])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
