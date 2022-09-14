import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Composition } from '../../../components/CompositionDialog/Composition.js'
import { startWatch } from '../../../utils/watcher.js'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector.js'

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<Composition type={reason} />)
}

export function injectPostDialogAtTwitter(signal: AbortSignal) {
    renderPostDialogTo('popup', postEditorContentInPopupSelector(), signal)
    renderPostDialogTo('timeline', rootSelector(), signal)
}
