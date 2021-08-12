import { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { Composition } from '../../../components/CompositionDialog/Composition'
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
        .at(-1)
        .map((x) => x.parentElement)
}

export function injectCompositionFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<UI />)
}
function UI() {
    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.requestComposition.sendToLocal({ reason: 'popup', open: true }),
        [],
    )
    return (
        <span style={{ display: 'block', padding: 0, marginTop: 0 }}>
            <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
            <Composition type="popup" />
        </span>
    )
}
