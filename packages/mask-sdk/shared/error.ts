export interface MaskEthereumProviderRpcErrorOptions extends ErrorOptions {
    // data?: unknown
}
export class MaskEthereumProviderRpcError extends Error implements Mask.Ethereum.ProviderRpcError {
    constructor(code: ErrorCode, message: ErrorMessages | string, options: MaskEthereumProviderRpcErrorOptions = {}) {
        const { cause = undefined } = options
        super(message, { cause })
        this.code = code
        // this.data = data
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
}

export enum ErrorMessages {
    FirstArgumentIsNotObject = 'Expected a single, non-array, object argument.',
    FirstArgumentMethodFieldInvalid = "'args.method' must be a non-empty string.",
    UnknownMethod = 'The method "$" does not exist / is not available.',
    // ParamsIsNotObjectOrArray = "'args.params' must be an object or array if provided.",
    ParamsIsNotArray = "'args.params' must be an array if provided.",
    InvalidMethodParams = 'Invalid method parameter(s).',
    wallet_requestPermissions_Empty = 'Permissions request for origin "$" contains no permissions.',
    wallet_requestPermissions_Unknown = 'Permissions request for origin "$" contains invalid requested permission(s).',
}
