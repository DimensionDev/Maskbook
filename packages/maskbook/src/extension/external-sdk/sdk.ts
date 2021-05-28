// !! Change existing signature of anything this file exports leads to a breaking change.
import { ThirdPartyPluginPermission } from '../background-script/ThirdPartyPlugin/types'
import Services from '../service'
import { SDKErrors } from './constant'

/** Version of this SDK */
export async function version() {
    return 1
}
export { __assertLocalContext, __validateRemoteContext } from './sdk/context'
export async function getProfile() {
    const granted = await Services.ThirdPartyPlugin.requestPermission(location.origin + '/', [
        ThirdPartyPluginPermission.DEBUG_Profiles,
    ])
    if (!granted) throw new Error(SDKErrors.M3_Permission_denied)
    return (await Services.Identity.queryProfiles()).map((x) => x.identifier.userId)
}
