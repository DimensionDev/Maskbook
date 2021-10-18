import Services from '../../extension/service'
import type { SocialNetworkUI } from '../types'

export function requestSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    const req = ui.permission?.request()
    if (req) return req
    return Services.Helper.requestBrowserPermission({ origins: [...ui.declarativePermissions.origins] })
}

export function hasSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    return ui.permission?.has() ?? browser.permissions.contains({ origins: [...ui.declarativePermissions.origins] })
}
