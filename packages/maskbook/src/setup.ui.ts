import './polyfill/index'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'
import { LiveSelector, Watcher, DOMProxy, Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { enhanceTypedMessageDebugger } from './protocols/typed-message/debugger'
import { applyWorkaround } from '@dimensiondev/maskbook-shared'

// Workaround for https://github.com/mui-org/material-ui/pull/24107#issuecomment-752837701
if (isEnvironment(Environment.ExtensionProtocol)) {
    applyWorkaround(document.body, document.head)
}

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
