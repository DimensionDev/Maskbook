import type { JsonRpcPayload } from 'web3-core-helpers'
import type { EthereumRpcComputed } from '@masknet/web3-shared'
import { useLocation } from 'react-router'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { useEffect } from 'react'

export function useRejectHandler(
    callback: () => void,
    value?: { payload: JsonRpcPayload; computedPayload?: EthereumRpcComputed },
) {
    const location = useLocation()

    const result = useAsyncFn(async () => {
        if (value) {
            const toBeClose = new URLSearchParams(location.search).get('toBeClose')
            await WalletRPC.deleteUnconfirmedRequest(value.payload)
            await Services.Ethereum.rejectRequest(value.payload)

            if (toBeClose) {
                window.close()
            } else {
                callback()
            }
        }
    }, [value, location.search, callback])

    const [_, handleReject] = result

    useEffect(() => {
        window.addEventListener('beforeunload', handleReject)
        return window.removeEventListener('beforeunload', handleReject)
    }, [handleReject])

    return result
}
