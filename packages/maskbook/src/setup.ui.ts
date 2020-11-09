import './polyfill/index'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'
import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit/es'
import { enhanceTypedMessageDebugger } from './protocols/typed-message/debugger'

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
