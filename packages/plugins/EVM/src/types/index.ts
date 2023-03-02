// https://www.jsonrpc.org/specification#error_object
export enum JSON_RPC_ERROR_CODE {
    INVALID_REQUEST = -32_600,
    METHOD_NOT_FOUND = 32_601,
    INVALID_PARAMS = -32_602,
    INTERNAL_ERROR = -32_603,
    SERVER_ERROR_RANGE_START = -32_000,
    SERVER_ERROR_RANGE_END = -32_099,
}
