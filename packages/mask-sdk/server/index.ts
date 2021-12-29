import { BridgeAPI, UserScriptAPI, createMaskSDKChannel, serializer } from '../shared'
import { AsyncCall, _AsyncVersionOf } from 'async-call-rpc'

export type { BridgeAPI, UserScriptAPI, InitInformation } from '../shared'
export function createMaskSDKServer(api: BridgeAPI, signal?: AbortSignal): _AsyncVersionOf<UserScriptAPI> {
    // TODO: support AbortSignal
    return AsyncCall<UserScriptAPI>(api, {
        serializer,
        channel: createMaskSDKChannel('content'),
        log: true,
        thenable: false,
    })
}
