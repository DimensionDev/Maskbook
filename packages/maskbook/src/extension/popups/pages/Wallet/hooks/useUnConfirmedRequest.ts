import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'

export const useUnconfirmedRequest = () => {
    return useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return
        const computedPayload = await Services.Ethereum.getJsonRpcComputed(payload)
        return {
            payload,
            computedPayload,
        }
    })
}
