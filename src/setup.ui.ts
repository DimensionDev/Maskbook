import { MessageCenter } from './utils/messages'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'

Object.assign(window, {
    definedSocialNetworkUIs: definedSocialNetworkUIs,
})
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
