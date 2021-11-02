import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit'
import { enhanceTypedMessageDebugger } from '../../protocols/typed-message/debugger'

if (typeof window === 'object') {
    LiveSelector.enhanceDebugger()
    Watcher.enhanceDebugger()
    DOMProxy.enhanceDebugger()
    enhanceTypedMessageDebugger()
}
