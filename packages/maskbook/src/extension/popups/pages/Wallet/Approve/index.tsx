import { memo } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'

const Approve = memo(() => {
    const { value } = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return
        const computedPayload = await Services.Ethereum.getJsonRpcComputed(payload)
        return {
            payload,
            computedPayload,
        }
    })
    return (
        <>
            <pre>{JSON.stringify(value?.payload, null, 2)}</pre>
            <pre>{JSON.stringify(value?.computedPayload, null, 2)}</pre>
        </>
    )
})

export default Approve
