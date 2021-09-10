import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk'
import { hmr_sdkServer } from './hmr-bridge'
import Services from '../service'
import { currentSNSContext } from './bridge/sns_context'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
async function start() {
    let meta: unknown = undefined
    if (currentSNSContext) meta = (await Services.ThirdPartyPlugin.getHostedMeta(currentSNSContext))?.[1]
    // TODO: listen to SNSContext connected status
    return maskSDK.request_init({ SNSContext: { connected: Boolean(currentSNSContext), meta } })
}
start()
