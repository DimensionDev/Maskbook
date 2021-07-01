//#region plugin definitions
export const PLUGIN_IDENTIFIER = 'com.maskbook.wallet'
export const PLUGIN_NAME = 'Wallet'
export const PLUGIN_ICON = '💰'
export const PLUGIN_DESCRIPTION = 'Mask Wallet'
//#endregion

// Private key at m/purpose'/coin_type'/account'/change
export const HD_PATH_WITHOUT_INDEX_ETHEREUM = "m/44'/60'/0'/0"

// https://www.jsonrpc.org/specification#error_object
export enum JSON_RPC_ErrorCode {
    INTERNAL_ERROR = -32603,
    SERVER_ERROR_RANGE_START = -32000,
    SERVER_ERROR_RANGE_END = -32099,
}

export const UPDATE_CHAIN_STATE_DELAY = 30 /* seconds */ * 1000 /* milliseconds */
