import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit'

if (typeof window === 'object') {
    LiveSelector.enhanceDebugger()
    Watcher.enhanceDebugger()
    DOMProxy.enhanceDebugger()
}
