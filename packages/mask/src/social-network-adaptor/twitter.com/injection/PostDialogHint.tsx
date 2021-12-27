import { useCallback } from 'react'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessages } from '../../../utils/messages'
import { hasEditor, isCompose } from '../utils/postBox'
import { startWatch } from '../../../utils/watcher'

export function injectPostDialogHintAtTwitter(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    renderPostDialogHintTo('timeline', postEditorInTimelineSelector(), signal)
    renderPostDialogHintTo(
        'popup',
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        signal,
    )
}

function renderPostDialogHintTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <PostDialogHintAtTwitter reason={reason} />,
    )
}

function PostDialogHintAtTwitter({ reason }: { reason: 'timeline' | 'popup' }) {
    const onHintButtonClicked = useCallback(
        () => MaskMessages.events.requestComposition.sendToLocal({ reason, open: true }),
        [reason],
    )
    return <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
}
