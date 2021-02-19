import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useEffectOnce } from 'react-use'
import { Toolbar } from '../../../components/InjectedComponents/Toolbar'
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
    renderInShadowRoot(<ToolbarPlaceholder />, {
        shadow: () => menuWatcher.firstDOMProxy.beforeShadow,
    })

    // inject toolbar
    const mainWatcher = new MutationObserverWatcher(main.clone())
    startWatch(mainWatcher)
    renderInShadowRoot(<ToolbarAtTwitter />, {
        shadow: () => mainWatcher.firstDOMProxy.beforeShadow,
    })
}

function ToolbarAtTwitter() {
    // inject global css
    useEffectOnce(() => {
        const sidebarResetStyle = document.createElement('style')
        sidebarResetStyle.innerHTML = `
            [data-testid="sidebarColumn"] > div:first-child > div:nth-child(2) > div:first-child > div:first-child > div:first-child {
                padding-top: 10px;
            }

            [data-testid="sidebarColumn"] > div:first-child > div:nth-child(2) > div:first-child > div:first-child > div:first-child > div:nth-child(2) {
                display: none;
            }
        `
        document.querySelector('head')?.appendChild(sidebarResetStyle)
    })

    return <Toolbar />
}
