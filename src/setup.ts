import './social-network-provider/facebook.com/ui-provider'
import './social-network-provider/facebook.com/worker-provider'
export function backgroundSetup() {
    Object.assign(window, {
        elliptic: require('elliptic'),
    })
}
import { activateSocialNetworkUI } from './social-network/ui'
export function uiSetup() {
    activateSocialNetworkUI()
}
