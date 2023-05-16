import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Composition } from '../../../components/CompositionDialog/Composition.js'
import { startWatch, type WatchOptions } from '../../../utils/watcher.js'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector.js'

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, options: WatchOptions) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, options)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal: options.signal }).render(
        <Composition type={reason} />,
    )
}

export function injectPostDialogAtTwitter(signal: AbortSignal) {
    renderPostDialogTo('popup', postEditorContentInPopupSelector(), {
        signal,
        missingReportRule: { name: 'PostDialog popup', rule: 'https://twitter.com/compose/tweet' },
    })
    renderPostDialogTo('timeline', rootSelector(), {
        signal,
        missingReportRule: { name: 'PostDialog timeline', rule: 'https://twitter.com/home' },
    })
}
