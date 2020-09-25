import React, { useCallback } from 'react'
import { createHash } from 'crypto'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { isMobileFacebook } from '../isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MessageCenter } from '../../../utils/messages'
import { Flags } from '../../../utils/flags'

interface UIProps {
    commentElement?: Element
    commentId?: string
}

let postEditorInPopupSelector: LiveSelector<Element>
if (isMobileFacebook) {
    postEditorInPopupSelector = new LiveSelector().querySelector('#structured_composer_form')
} else {
    postEditorInPopupSelector = new LiveSelector()
        .querySelectorAll('form [role="button"][tabindex="-1"]')
        .map((x) => x.parentElement)
        // TODO: should be nth(-1), see https://github.com/DimensionDev/Holoflows-Kit/issues/270
        .reverse()
        .nth(0)
}

const postEditorInCommentSelector: LiveSelector<Element> = new LiveSelector()
    .querySelectorAll('[role="article"] [role="presentation"]')
    .map((x) => x.parentElement)
    .reverse()

export function injectPostBoxFacebook() {
    new MutationObserverWatcher(postEditorInCommentSelector.clone())
        .useForeach((element, key, metadata) => {
            const commentId = createHash('md5').update(element.innerHTML).digest().toString('hex')
            renderInShadowRoot(<UI commentId={commentId} commentElement={element} />, {
                shadow: () => metadata.afterShadow,
                normal: () => metadata.after,
                rootProps: { style: { display: 'block', padding: '0 16px', marginTop: 16 } },
            })
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        .startWatch({
            childList: true,
            subtree: true,
        })

    const watcher = new MutationObserverWatcher(postEditorInPopupSelector.clone())
        .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        .startWatch({
            childList: true,
            subtree: true,
        })
    renderInShadowRoot(<UI />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        normal: () => watcher.firstDOMProxy.after,
        rootProps: { style: { display: 'block', padding: '0 16px', marginTop: 16 } },
    })
}
function UI({ commentId, commentElement }: UIProps) {
    const onHintButtonClicked = useCallback(
        () => MessageCenter.emit('compositionUpdated', { reason: 'popup', open: true, commentId }),
        [commentId],
    )
    return (
        <>
            <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
            <PostDialog reason="popup" commentId={commentId} commentElement={commentElement} />
        </>
    )
}
