import { createMaskSDKServer, type UserScriptAPI } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'

export let maskSDK: UserScriptAPI
export async function startMaskSDK() {
    maskSDK = createMaskSDKServer(hmr_sdkServer)
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({
        debuggerMode: process.env.NODE_ENV === 'development',
    })
}
