import { isNil } from 'lodash-es'
import type { JsonRpcResponse } from 'web3-core-helpers'
import type { RecognizableError } from '@masknet/web3-shared-base'

// https://www.jsonrpc.org/specification#error_object
export enum JSON_RPC_ERROR_CODE {
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = 32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603,
    SERVER_ERROR_RANGE_START = -32000,
    SERVER_ERROR_RANGE_END = -32099,
}

/**
 * JSON RPC Error Editor
 */
export class ErrorEditor {
    constructor(
        private unknownError: unknown,
        private response?: JsonRpcResponse | null,
        private fallback?: string,
    ) {}

    private get internalError(): Error {
        {
            const rpcError = this.unknownError
            if (rpcError instanceof Error && rpcError.message) return rpcError
            if (rpcError && typeof (rpcError as Error).message === 'string')
                return new Error((rpcError as Error).message)
            if (rpcError && typeof rpcError === 'string') return new Error(rpcError)
        }

        {
            const responseError = this.response?.error as unknown
            if (responseError instanceof Error) return responseError
            if (responseError && typeof (responseError as Error).message === 'string')
                return new Error((responseError as Error).message)
            if (responseError && typeof responseError === 'string') return new Error(responseError)
        }

        if (this.fallback) return new Error(this.fallback)
        return new Error('Unknown Error.')
    }

    /**
     * At least an error exists.
     */
    get presence() {
        return !isNil(this.unknownError) || !isNil(this.response?.error)
    }

    /**
     * Preprocess and normalize the error.
     */
    get error() {
        const RecognizableErrorMessage = (() => {
            const { code, message } = this.internalError as unknown as {
                code?: number
                message: string
            }

            if (message.includes(`"code":${JSON_RPC_ERROR_CODE.INTERNAL_ERROR}`))
                return 'Transaction was failed due to an internal JSON-RPC server error.'
            if (message.includes('User denied message signature.')) return 'Signature canceled.'
            if (message.includes('User denied transaction signature.')) return 'Transaction was rejected!'
            if (message.includes('transaction underpriced')) return 'Transaction underpriced.'
            if (
                message.includes('The NFT is bounded to your soul, you cannot transfer it!') ||
                message.match(/Please go to .* for mint/)
            ) {
                return 'This NFT can not be transferred.'
            }
            if (
                typeof code === 'number' &&
                (code === JSON_RPC_ERROR_CODE.INTERNAL_ERROR ||
                    (code <= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_START &&
                        code >= JSON_RPC_ERROR_CODE.SERVER_ERROR_RANGE_END))
            ) {
                return 'Transaction was failed due to an internal JSON-RPC server error.'
            }
            return undefined
        })()

        if (RecognizableErrorMessage) {
            const error = new Error(RecognizableErrorMessage) as RecognizableError
            error.isRecognized = true
            return error
        }
        return new Error(this.internalError.message)
    }

    static fromError(error: unknown, fallback?: string) {
        return new ErrorEditor(error, null, fallback)
    }

    static from(error: unknown, response?: JsonRpcResponse | null, fallback?: string) {
        return new ErrorEditor(error, response, fallback)
    }
}
