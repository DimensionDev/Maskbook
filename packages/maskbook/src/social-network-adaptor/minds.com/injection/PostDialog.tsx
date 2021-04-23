import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useRef } from 'react'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { composerModalSelector, rootSelector } from '../utils/selector'

export function injectPostDialogAtMinds(signal: AbortSignal) {
    renderPostDialogTo('popup', composerModalSelector(), signal)
    renderPostDialogTo('timeline', rootSelector(), signal)
}

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<PostDialogAtMinds reason={reason} />)
}

function PostDialogAtMinds(props: { reason: 'timeline' | 'popup' }) {
    const rootRef = useRef<HTMLDivElement>(null)
    const dialogProps =
        props.reason === 'popup'
            ? {
                  disablePortal: true,
                  container: () => rootRef.current,
              }
            : {}
    const dialog = <PostDialog DialogProps={dialogProps} reason={props.reason} />

    // ! Render dialog into native composition view instead of portal shadow
    // ! More https://github.com/DimensionDev/Maskbook/issues/837
    return props.reason === 'popup' ? <div ref={rootRef}>{dialog}</div> : dialog
}
