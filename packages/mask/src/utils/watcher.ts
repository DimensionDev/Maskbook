import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../shared'

export function startWatch<T extends MutationObserverWatcher<any, any, any, any>>(watcher: T, signal: AbortSignal) {
    watcher
        .setDOMProxyOption({
            afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
            beforeShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
        })
        .startWatch({ subtree: true, childList: true })
    signal.addEventListener('abort', () => watcher.stopWatch())
    return watcher
}
