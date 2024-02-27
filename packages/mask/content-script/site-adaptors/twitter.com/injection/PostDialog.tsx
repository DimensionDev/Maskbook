import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Composition } from '../../../components/CompositionDialog/Composition.js'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector.js'
import { startWatch, type WatchOptions } from '../../../utils/startWatch.js'

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, options: WatchOptions) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, options)

    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal: options.signal }).render(
        <Composition type={reason} />,
    )
}

export function injectPostDialogAtTwitter(signal: AbortSignal) {
    renderPostDialogTo('popup', postEditorContentInPopupSelector(), {
        signal,
    })
    renderPostDialogTo('timeline', rootSelector(), {
        signal,
    })
}
