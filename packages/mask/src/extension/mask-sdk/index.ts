import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'
import Services from '../service.js'
import { currentSiteContext } from './bridge/site_context.js'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
async function start() {
    let meta: unknown = undefined
    if (currentSiteContext) meta = (await Services.ThirdPartyPlugin.getHostedMeta(currentSiteContext))?.[1]
    // TODO: listen to SiteContext connected status
    return maskSDK.request_init({ context: { connected: !!currentSiteContext, meta } })
}
start()
