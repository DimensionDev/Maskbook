//#region plugin definitions
export const PLUGIN_IDENTIFIER = 'com.maskbook.ethereum'
//#endregion

// https://www.jsonrpc.org/specification#error_object
export enum JSON_RPC_ErrorCode {
    INTERNAL_ERROR = -32603,
    SERVER_ERROR_RANGE_START = -32000,
    SERVER_ERROR_RANGE_END = -32099,
}
