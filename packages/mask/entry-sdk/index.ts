import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'

export async function startMaskSDK() {
    const maskSDK = createMaskSDKServer(hmr_sdkServer)
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({
        debuggerMode: process.env.NODE_ENV === 'development',
    })
}
