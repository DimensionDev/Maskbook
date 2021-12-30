import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { isMobileFacebook } from '../utils/isMobile'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt'
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
}

export function injectSetupPromptFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <span
            style={{
                display: 'block',
                padding: '0 16px',
                marginTop: 0,
            }}>
            <NotSetupYetPrompt />
        </span>,
    )
}
