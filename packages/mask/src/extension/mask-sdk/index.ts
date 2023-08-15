import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'
import Services from '../service.js'
import { currentSiteContext } from './bridge/site_context.js'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
export async function startMaskSDK() {
    let meta
    if (currentSiteContext) {
        const data = await Services.ThirdPartyPlugin.getHostedMeta(currentSiteContext)
        if (data) meta = new Map([data])
    }
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({
        context: { connected: !!currentSiteContext, meta },
        debuggerMode: process.env.NODE_ENV === 'development',
    })
}
