import { useRef } from 'react'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
export function injectPostDialogAtTwitter(signal: AbortSignal) {
    renderPostDialogTo('popup', postEditorContentInPopupSelector(), signal)
    renderPostDialogTo('timeline', rootSelector(), signal)
}

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    renderInShadowRoot(<PostDialogAtTwitter reason={reason} />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        signal,
    })
}

function PostDialogAtTwitter(props: { reason: 'timeline' | 'popup' }) {
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
