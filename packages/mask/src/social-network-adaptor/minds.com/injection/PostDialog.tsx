import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Composition } from '../../../components/CompositionDialog/Composition.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { composerModalSelector, rootSelector } from '../utils/selector.js'

export function injectPostDialogAtMinds(signal: AbortSignal) {
    renderPostDialogTo('popup', composerModalSelector(), signal)
    renderPostDialogTo('timeline', rootSelector(), signal)
}

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <Composition requireClipboardPermission type={reason} />,
    )
}
