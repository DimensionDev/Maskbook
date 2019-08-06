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

    if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query && browser.tabs.remove) {
        const close = window.close
        window.close = () => {
            Reflect.apply(close, window, [])
            setTimeout(async () => {
                const { id } = await browser.tabs.getCurrent()
                id && (await browser.tabs.remove(id))
            }, 400)
        }
    }
}
