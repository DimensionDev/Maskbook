import './social-network-provider/facebook.com/ui-provider'
import './social-network-provider/facebook.com/worker-provider'
export function backgroundSetup() {
    Object.assign(window, {
        elliptic: require('elliptic'),
    })
}
import { definedSocialNetworkUIs } from './social-network/ui'
import { env } from './social-network/shared'
export function uiSetup() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.name, ui)
            ui.init(env, {})
        }
}
