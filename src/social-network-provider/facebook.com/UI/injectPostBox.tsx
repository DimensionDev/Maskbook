import React, { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { isMobileFacebook } from '../isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MessageCenter } from '../../../utils/messages'
import { Flags } from '../../../utils/flags'

let composeBox: LiveSelector<Element>
if (isMobileFacebook) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    composeBox = new LiveSelector()
        .querySelector('[role="dialog"] form')
        .querySelectorAll('[role="button"][tabindex="0"], [role="button"][tabindex="-1"]')
        .map((x) => x.parentElement)
        // TODO: should be nth(-1), see https://github.com/DimensionDev/Holoflows-Kit/issues/270
        .reverse()
        .nth(0)
}
export function injectPostBoxFacebook() {
    const watcher = new MutationObserverWatcher(composeBox.clone())
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
