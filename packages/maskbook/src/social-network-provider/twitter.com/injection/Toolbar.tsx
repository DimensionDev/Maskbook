import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ToolbarAtTwitter, TOOLBAR_HEIGHT } from '../../../components/InjectedComponents/ToolbarAtTwitter'
import { ToolbarPlaceholder } from '../../../components/InjectedComponents/ToolbarPlaceholder'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { twitterUrl } from '../utils/url'

const main = new LiveSelector().querySelector('body > noscript')
const menu = new LiveSelector().querySelector('[role="banner"] [role="heading"]')

export function injectToolbarAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return

    // inject placeholder into left column
    const menuWatcher = new MutationObserverWatcher(menu.clone())
    startWatch(menuWatcher)
    renderInShadowRoot(<ToolbarPlaceholder expectedHeight={TOOLBAR_HEIGHT} />, {
        shadow: () => menuWatcher.firstDOMProxy.beforeShadow,
    })

    // inject toolbar
    const mainWatcher = new MutationObserverWatcher(main.clone())
    startWatch(mainWatcher)
    renderInShadowRoot(<ToolbarAtTwitter />, {
        shadow: () => mainWatcher.firstDOMProxy.beforeShadow,
    })
}
