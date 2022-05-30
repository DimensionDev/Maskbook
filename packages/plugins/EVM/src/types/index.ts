// https://www.jsonrpc.org/specification#error_object
export enum JSON_RPC_ERROR_CODE {
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = 32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603,
    SERVER_ERROR_RANGE_START = -32000,
    SERVER_ERROR_RANGE_END = -32099,
}
