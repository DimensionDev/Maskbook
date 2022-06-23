import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../shared'

export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, signal: AbortSignal) {
    watcher
        .setDOMProxyOption({
            afterShadowRootInit: { mode: Flags.shadowRootMode },
            beforeShadowRootInit: { mode: Flags.shadowRootMode },
        })
        .startWatch({ subtree: true, childList: true }, signal)
    return watcher
}
