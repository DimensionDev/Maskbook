export interface MaskEthereumProviderRpcErrorOptions extends ErrorOptions {
    code: number
    data: unknown
    message?: string
}
export class MaskEthereumProviderRpcError extends Error implements Mask.Ethereum.ProviderRpcError {
    constructor(options: MaskEthereumProviderRpcErrorOptions) {
        const { cause, code, data, message } = options
        super(message, { cause })
        this.code = code
        this.data = data
    }
    code: number
    data?: unknown
}
