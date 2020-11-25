import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { isMobileFacebook } from '../isMobile'
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
        // TODO: should be nth(-1), see https://github.com/DimensionDev/Holoflows-Kit/issues/270
        .reverse()
        .nth(0)
}

export function injectSetupPromptFacebook() {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher)
    renderInShadowRoot(<NotSetupYetPrompt />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        rootProps: {
            style: {
                display: 'block',
                padding: '0 16px',
                marginTop: 0,
            },
        },
    })
}
