import { useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessage } from '../../../utils/messages'
import { hasEditor, isCompose } from '../utils/postBox'
import { startWatch } from '../../../utils/watcher'

export function injectPostDialogHintAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    renderPostDialogHintTo('timeline', postEditorInTimelineSelector())
    renderPostDialogHintTo(
        'popup',
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
    )
}

function renderPostDialogHintTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher)

    renderInShadowRoot(<PostDialogHintAtTwitter reason={reason} />, { shadow: () => watcher.firstDOMProxy.afterShadow })
}

function PostDialogHintAtTwitter({ reason }: { reason: 'timeline' | 'popup' }) {
    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason, open: true }),
        [reason],
    )
    return <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
}
