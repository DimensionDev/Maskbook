import { isNil } from 'lodash-unified'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { JSON_RPC_ERROR_CODE } from '@masknet/plugin-wallet'
import { i18n } from '../../../../shared-ui/locales_legacy'

function getInternalError(error: unknown, response?: JsonRpcResponse | null, fallback?: string): Error {
    {
        const rpcError = error
        if (rpcError instanceof Error && rpcError.message) return rpcError
        if (rpcError && typeof (rpcError as Error).message === 'string') return new Error((rpcError as Error).message)
        if (rpcError && typeof rpcError === 'string') return new Error(rpcError)
    }

    {
        const responseError = response?.error as unknown
        if (responseError instanceof Error) return getError(responseError, null, fallback)
        if (responseError && typeof (responseError as Error).message === 'string')
            return getError(responseError, null, fallback)
        if (responseError && typeof responseError === 'string') return new Error(responseError)
    }
    if (fallback) return new Error(fallback)
    return new Error('Unknown Error.')
}

export function hasError(error: unknown, response?: JsonRpcResponse | null) {
    return !isNil(error) || !isNil(response?.error)
}

export function getError(error: unknown, response?: JsonRpcResponse | null, fallback?: string): Error {
    const internalError = getInternalError(error, response, fallback)
    const internalErrorMessage = (() => {
        const { code, message } = internalError as unknown as { code?: number; message: string }

        if (message.includes(`"code":${JSON_RPC_ERROR_CODE.INTERNAL_ERROR}`))
            return i18n.t('plugin_wallet_transaction_server_error')
        if (message.includes('User denied message signature.')) return i18n.t('plugin_wallet_cancel_sign')
        if (message.includes('User denied transaction signature.')) return i18n.t('plugin_wallet_transaction_rejected')
        if (message.includes('transaction underpriced')) return i18n.t('plugin_wallet_transaction_underpriced')
        if (
            typeof code === 'number' &&
            (code === JSON_RPC_ERROR_CODE.INTERNAL_ERROR ||
                (code <= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_START &&
                    code >= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_END))
        ) {
            return i18n.t('plugin_wallet_transaction_server_error')
        }
        return internalError.message
    })()

    return new Error(internalErrorMessage)
}
