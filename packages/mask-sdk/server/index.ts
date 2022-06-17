import { BridgeAPI, UserScriptAPI, createMaskSDKChannel, serializer } from '../shared'
import { AsyncCall, AsyncVersionOf } from 'async-call-rpc'

export type { BridgeAPI, UserScriptAPI, InitInformation } from '../shared'
export function createMaskSDKServer(api: BridgeAPI, signal?: AbortSignal): AsyncVersionOf<UserScriptAPI> {
    // TODO: support AbortSignal
    return AsyncCall<UserScriptAPI>(api, {
        serializer,
        channel: createMaskSDKChannel('content'),
        log: true,
        thenable: false,
    })
}
