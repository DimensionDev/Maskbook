import type { MaskEthereumProviderRpcError } from '../shared/error.js'
import { type BridgeAPI, type UserScriptAPI, createMaskSDKChannel, encoder } from '../shared/index.js'
import { AsyncCall, type AsyncVersionOf } from 'async-call-rpc/full'

export type * from '../shared/types.js'
export {
    MaskEthereumProviderRpcError,
    type BridgeAPI,
    type UserScriptAPI,
    type InitInformation,
    ErrorCode,
    ErrorMessages,
    fromMessage,
    err,
    type MaskEthereumProviderRpcErrorOptions,
} from '../shared/index.js'

export function createMaskSDKServer(api: BridgeAPI, signal?: AbortSignal): AsyncVersionOf<UserScriptAPI> {
    return AsyncCall<UserScriptAPI>(api, {
        signal,
        encoder,
        channel: createMaskSDKChannel('content'),
        log: false,
        thenable: false,
        mapError(error) {
            return {
                code: (error as MaskEthereumProviderRpcError).code,
                message: (error as MaskEthereumProviderRpcError).message,
                data: error,
            }
        },
    })
}
