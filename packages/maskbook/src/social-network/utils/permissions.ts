import type { SocialNetworkUI } from '../types'

export function requestSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    return ui.permission?.request() ?? browser.permissions.request({ origins: [...ui.declarativePermissions.origins] })
}

export function hasSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    return ui.permission?.has() ?? browser.permissions.contains({ origins: [...ui.declarativePermissions.origins] })
}
