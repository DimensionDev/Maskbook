import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'

export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, signal: AbortSignal) {
    watcher
        .setDOMProxyOption({
            afterShadowRootInit: { mode: process.env.shadowRootMode },
            beforeShadowRootInit: { mode: process.env.shadowRootMode },
        })
        .startWatch({ subtree: true, childList: true }, signal)
    return watcher
}
