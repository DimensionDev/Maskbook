import './polyfill/index'
import './utils/debug/general'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './social-network-adaptor'
import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit'
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
