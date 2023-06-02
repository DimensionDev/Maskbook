import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { isMobileFacebook } from '../utils/isMobile.js'
import { Banner } from '../../../components/Welcomes/Banner.js'
import { startWatch } from '../../../utils/watcher.js'

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

export function injectBannerAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <span
            style={{
                display: 'block',
                padding: '0 16px',
                marginTop: 0,
            }}>
            <Banner />
        </span>,
    )
}
