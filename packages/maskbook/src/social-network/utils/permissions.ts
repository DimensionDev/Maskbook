import Services from '../../extension/service'
import type { SocialNetworkUI } from '../types'

export function requestSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    const req = ui.permission?.request()
    if (req) return req
    return Services.Helper.requestExtensionPermission({ origins: [...ui.declarativePermissions.origins] })
}
