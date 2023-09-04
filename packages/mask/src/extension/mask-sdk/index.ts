import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'
import Services from '#services'
import { currentSiteContext } from './bridge/site_context.js'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
export async function startMaskSDK() {
    const data = currentSiteContext ? await Services.ThirdPartyPlugin.getHostedMeta(currentSiteContext) : undefined
    const meta = data ? new Map([data]) : undefined
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({
        context: { connected: !!currentSiteContext, meta },
        debuggerMode: process.env.NODE_ENV === 'development',
    })
}
