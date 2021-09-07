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

    const cleanConfirmRequest = useCallback(() => {
        if (value) {
            Services.Ethereum.rejectRequest(value.payload)
        }
    }, [value])

    const handleReject = useCallback(async () => {
        const toBeClose = new URLSearchParams(location.search).get('toBeClose')
        cleanConfirmRequest()

        if (toBeClose) {
            window.close()
        } else {
            callback()
        }
    }, [location.search, cleanConfirmRequest])

    useEffect(() => {
        window.addEventListener('beforeunload', handleReject)
        return () => window.removeEventListener('beforeunload', handleReject)
    }, [handleReject])

    return handleReject
}
