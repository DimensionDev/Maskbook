import { MessageCenter } from './utils/messages'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'

Object.assign(globalThis, {
    definedSocialNetworkUIs: definedSocialNetworkUIs,
})
activateSocialNetworkUI()

const close = globalThis.close
globalThis.close = () => {
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
// ? FIXME: code breaks on Firefox. This code can fix it.
{
    const old = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = cb => {
        return Reflect.apply(old, window, [cb])
    }
}
