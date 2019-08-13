import './social-network-provider/facebook.com/ui-provider'
import './social-network-provider/facebook.com/worker-provider'
import './social-network-provider/options-page/index'
export function backgroundSetup() {
    Object.assign(window, {
        elliptic: require('elliptic'),
    })
    MessageCenter.on('closeActiveTab', async () => {
        const tabs = await browser.tabs.query({
            active: true,
        })
        if (tabs[0]) {
            await browser.tabs.remove(tabs[0].id!)
        }
    })
}
import { activateSocialNetworkUI, definedSocialNetworkUIs } from './social-network/ui'
import { definedSocialNetworkWorkers } from './social-network/worker'
import { MessageCenter } from './utils/messages'
Object.assign(window, { definedSocialNetworkWorkers, definedSocialNetworkUIs })
export function uiSetup() {
    activateSocialNetworkUI()

    const close = window.close
    window.close = () => {
        Reflect.apply(close, window, [])
        setTimeout(async () => {
            if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query && browser.tabs.remove) {
                const { id } = await browser.tabs.getCurrent()
                id && (await browser.tabs.remove(id))
            } else {
                MessageCenter.emit('closeActiveTab', undefined)
            }
        }, 400)
    }
}
