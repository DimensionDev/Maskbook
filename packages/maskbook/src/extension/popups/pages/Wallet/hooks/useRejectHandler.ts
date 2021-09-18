import type { JsonRpcPayload } from 'web3-core-helpers'
import type { EthereumRpcComputed } from '@masknet/web3-shared'
import { useLocation } from 'react-router'
import Services from '../../../../service'
import { useCallback, useEffect } from 'react'

export function useRejectHandler(
    callback: () => void,
    value?: { payload: JsonRpcPayload; computedPayload?: EthereumRpcComputed },
) {
    const location = useLocation()
    const toBeClose = new URLSearchParams(location.search).get('toBeClose')
    const cleanConfirmRequest = useCallback(async () => {
        if (value) {
            await Services.Ethereum.rejectRequest(value.payload)
        }
    }, [value])

    const handleReject = useCallback(async () => {
        await cleanConfirmRequest()

        if (toBeClose) {
            window.close()
        } else {
            callback()
        }
    }, [cleanConfirmRequest, toBeClose])

    useEffect(() => {
        if (toBeClose) {
            window.addEventListener('beforeunload', handleReject)
            return () => window.removeEventListener('beforeunload', handleReject)
        }
        return
    }, [handleReject, toBeClose])

    return handleReject
}
