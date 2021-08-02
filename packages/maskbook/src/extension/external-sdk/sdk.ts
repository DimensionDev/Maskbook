// !! Change existing signature of anything this file exports leads to a breaking change.
import { MaskMessage } from '../../utils'
import { ThirdPartyPluginPermission } from '../background-script/ThirdPartyPlugin/types'
import Services from '../service'
import { currentBaseURL, SDKErrors } from './constant'
import { __validateRemoteContext } from './sdk/context'

/** Version of this SDK */
export async function version() {
    return 1
}
export { __assertLocalContext, __validateRemoteContext } from './sdk/context'
export async function getProfile() {
    const granted = await Services.ThirdPartyPlugin.requestPermission(new URL('./', location.href).toString(), [
        ThirdPartyPluginPermission.DEBUG_Profiles,
    ])
    if (!granted) throw new Error(SDKErrors.M3_Permission_denied)
    return (await Services.Identity.queryProfiles()).map((x) => x.identifier.userId)
}
export async function setPayload(payload: Record<string, unknown>, options: { additionText: string }) {
    const context = await __validateRemoteContext()

    const url = currentBaseURL.replace(/^https?:\/\//, '')
    const namespacedPayload: Record<string, unknown> = {}
    for (const key in payload) {
        // plugin:dimensiondev.github.io/Mask-Plugin-Example/@v1
        namespacedPayload[`plugin:${url}@${key}`] = payload[key]
    }

    MaskMessage.events.thirdPartySetPayload.sendToContentScripts({
        payload: namespacedPayload,
        context,
        appendText: options.additionText,
    })
}
