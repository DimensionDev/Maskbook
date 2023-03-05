import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk.js'
import { hmr_sdkServer } from './hmr-bridge.js'
import Services from '../service.js'
import { currentSNSContext } from './bridge/sns_context.js'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
async function start() {
    let meta: unknown = undefined
    if (currentSNSContext) meta = (await Services.ThirdPartyPlugin.getHostedMeta(currentSNSContext))?.[1]
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({ SNSContext: { connected: !!currentSNSContext, meta } })
}
start()
