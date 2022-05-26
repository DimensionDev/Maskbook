import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'

export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, signal: AbortSignal) {
    watcher
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
            beforeShadowRootInit: { mode: 'closed' },
        })
        .startWatch({ subtree: true, childList: true }, signal)
    return watcher
}
