import type { Ethereum } from '../public-api/mask-wallet.js'
export interface MaskEthereumProviderRpcErrorOptions extends ErrorOptions {
    data?: unknown
}
export class MaskEthereumProviderRpcError extends Error implements Ethereum.ProviderRpcError {
    constructor(code: number, message: string, options: MaskEthereumProviderRpcErrorOptions = {}) {
        const { cause = undefined, data } = options
        super(message, { cause })
        this.code = code
        this.data = data
        delete this.stack
    }
    code: number
    data?: unknown
}
export enum ErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    UserRejectedTheRequest = 4001,
    RequestedAccountHasNotBeenAuthorized = 4100,
}
