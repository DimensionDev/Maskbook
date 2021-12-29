import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { Composition } from '../../../components/CompositionDialog/Composition'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<Composition type={reason} />)
}

export function injectPostDialogAtTwitter(signal: AbortSignal) {
    renderPostDialogTo('popup', postEditorContentInPopupSelector(), signal)
    renderPostDialogTo('timeline', rootSelector(), signal)
}
