import { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { isMobileFacebook } from '../utils/isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessage } from '../../../utils/messages'
import { startWatch } from '../../../utils/watcher'
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
        .nth(2)
        .map((x) => x.parentElement)
}

export function injectCompositionFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    renderInShadowRoot(<UI />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        rootProps: {
            style: {
                display: 'block',
                padding: 0,
                marginTop: 0,
            },
        },
        signal,
    })
}
function UI() {
    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'popup', open: true }),
        [],
    )
    return (
        <>
            <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
            <PostDialog reason="popup" />
        </>
    )
}
