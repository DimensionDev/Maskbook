import { LiveSelector, Watcher, DOMProxy } from '@dimensiondev/holoflows-kit'

if (typeof window === 'object' && process.env.NODE_ENV === 'development') {
    LiveSelector.enhanceDebugger()
    Watcher.enhanceDebugger()
    DOMProxy.enhanceDebugger()
}
