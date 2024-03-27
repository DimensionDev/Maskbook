import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { Banner } from '../../../components/Welcomes/Banner.js'

const composeBox: LiveSelector<Element> = new LiveSelector()
    .querySelectorAll(
        '[role="dialog"] form [role="button"][tabindex="0"], [role="dialog"] form [role="button"][tabindex="-1"]',
    )
    .map((x) => x.parentElement)
    .at(-1)

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
