import { type BridgeAPI, type UserScriptAPI, createMaskSDKChannel, serializer } from '../shared/index.js'
import { AsyncCall, type AsyncVersionOf } from 'async-call-rpc/full'

export type { BridgeAPI, UserScriptAPI, InitInformation } from '../shared/index.js'
export { MaskEthereumProviderRpcError, type MaskEthereumProviderRpcErrorOptions } from '../shared/error.js'
export function createMaskSDKServer(api: BridgeAPI, signal?: AbortSignal): AsyncVersionOf<UserScriptAPI> {
    // TODO: support AbortSignal
    return AsyncCall<UserScriptAPI>(api, {
        serializer,
        channel: createMaskSDKChannel('content'),
        log: false,
        thenable: false,
    })
}
