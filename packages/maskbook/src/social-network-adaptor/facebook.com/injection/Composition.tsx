import { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { Composition } from '../../../components/CompositionDialog/Composition'
import { isMobileFacebook } from '../utils/isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessages } from '../../../utils/messages'
import { startWatch } from '../../../utils/watcher'
import { taskOpenComposeBoxFacebook } from '../automation/openComposeBox'

let composeBox: LiveSelector<Element>
if (isMobileFacebook) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    composeBox = new LiveSelector()
        .querySelector(
            '[role="dialog"] form > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child > div:last-child > div:first-child',
        )
        .querySelectorAll('[role="button"][tabindex="0"], [role="button"][tabindex="-1"]')
        .map((x) => x.parentElement)
        .at(-2)
        .map((x) => x.parentElement)
        .map((x) => x.parentElement)
}

export function injectCompositionFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<UI />)

    signal.addEventListener(
        'abort',
        MaskMessages.events.requestComposition.on((data) => {
            if (data.reason === 'popup') return
            if (data.open === false) return
            taskOpenComposeBoxFacebook(data.content || '', data.options)
        }),
    )
}
function UI() {
    const onHintButtonClicked = useCallback(
        () => MaskMessages.events.requestComposition.sendToLocal({ reason: 'popup', open: true }),
        [],
    )
    return (
        <span style={{ display: 'block', padding: 0, marginTop: 0 }}>
            <PostDialogHint onHintButtonClicked={onHintButtonClicked} />
            <Composition type="popup" />
        </span>
    )
}
