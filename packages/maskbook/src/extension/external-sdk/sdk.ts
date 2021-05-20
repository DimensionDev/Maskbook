import { ThirdPartyPluginPermission } from '../background-script/ThirdPartyPlugin/types'
import Services from '../service'

/** Version of this SDK */
export async function version() {
    return 1
}
export async function echo<T>(x: T) {
    return x
}
export async function getProfile() {
    const granted = await Services.ThirdPartyPlugin.requestPermission(location.origin + '/', [
        ThirdPartyPluginPermission.DEBUG_Profiles,
    ])
    if (!granted) throw new Error('Permission not granted')
    return (await Services.Identity.queryProfiles()).map((x) => x.identifier.userId)
}
