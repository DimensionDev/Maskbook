import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useEffect } from 'react'
import { WalletMessages } from '@masknet/plugin-wallet'

export const useUnconfirmedRequest = () => {
    const result = useAsyncRetry(async () => {
        // const payload = await WalletRPC.firstUnconfirmedRequest()
        // if (!payload) return
        // const computedPayload = await EVM_RPC.getComputedPayload(payload)
        // return {
        //     payload,
        //     computedPayload,
        // }
    }, [])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
