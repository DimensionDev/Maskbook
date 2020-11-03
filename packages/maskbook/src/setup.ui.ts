import './polyfill/index'
import { MessageCenter } from './utils/messages'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'
import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit/es'
import { exclusiveTasks } from './extension/content-script/tasks'
import { enhanceTypedMessageDebugger } from './protocols/typed-message/debugger'
import { Flags } from './utils/flags'

if (typeof window === 'object') {
    LiveSelector.enhanceDebugger()
    Watcher.enhanceDebugger()
    DOMProxy.enhanceDebugger()
    enhanceTypedMessageDebugger()
}
Object.assign(globalThis, {
    definedSocialNetworkUIs: definedSocialNetworkUIs,
})
activateSocialNetworkUI()

const close = globalThis.close
globalThis.close = () => {
    if (Flags.has_no_browser_tab_ui) {
        // TODO: support twitter
        exclusiveTasks('https://m.facebook.com/')
        return
    }
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
