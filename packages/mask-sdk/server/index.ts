import { BridgeAPI, UserScriptAPI, createMaskSDKChannel, serializer } from '../shared'
import { AsyncCall } from 'async-call-rpc'

export type { BridgeAPI } from '../shared'
export function createMaskSDKServer(api: BridgeAPI, signal?: AbortSignal) {
    // TODO: support AbortSignal
    return AsyncCall<UserScriptAPI>(api, {
        serializer,
        channel: createMaskSDKChannel('content'),
        log: true,
        thenable: false,
    })
}
