import { isNil } from 'lodash-unified'
import type { JsonRpcResponse } from 'web3-core-helpers'

export function hasError(error: unknown, response?: JsonRpcResponse | null) {
    return !isNil(error) || !isNil(response?.error)
}

export function getError(error: unknown, response?: JsonRpcResponse | null, fallback?: string): Error {
    if (error instanceof Error && error.message) return error
    if (typeof error === 'string' && error) return new Error(error)
    const responseError = response?.error as unknown
    if (responseError instanceof Error) return getError(responseError, null, fallback)
    if (typeof response?.error === 'string' && response?.error) return new Error(response.error)
    if (fallback) return new Error(fallback)
    return new Error('Unknown Error.')
}
