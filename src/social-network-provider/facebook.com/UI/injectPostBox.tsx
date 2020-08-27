import React, { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { isMobileFacebook } from '../isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MessageCenter } from '../../../utils/messages'

let composeBox: LiveSelector<Element>
if (isMobileFacebook) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    composeBox = new LiveSelector()
        .querySelector('[aria-multiline="true"][contenteditable="true"][role="textbox"]')
        .closest('[role="dialog"], #pagelet_event_composer')
        .map((x) => (x.getAttribute('role') === 'dialog' ? x.lastElementChild!.lastElementChild : x))
}
export function injectPostBoxFacebook() {
    const watcher = new MutationObserverWatcher(composeBox.clone().enableSingleMode())
        .setDOMProxyOption({ afterShadowRootInit: { mode: webpackEnv.shadowRootMode } })
        .startWatch({
            childList: true,
            subtree: true,
        })
    renderInShadowRoot(<UI />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        normal: () => watcher.firstDOMProxy.after,
    })
}
function UI() {
    const onHintButtonClicked = useCallback(
        () => MessageCenter.emit('compositionUpdated', { reason: 'popup', open: true }),
        [],
    )
    return (
        <>
            <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
            <PostDialog reason="popup" />
        </>
    )
}
