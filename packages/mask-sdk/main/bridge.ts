import { createMaskSDKChannel, BridgeAPI, UserScriptAPI, serializer } from '../shared'
import { AsyncCall } from 'async-call-rpc/base.min'

const self: UserScriptAPI = {}
export const contentScript = AsyncCall<BridgeAPI>(self, {
    channel: createMaskSDKChannel('user'),
    serializer,
})
