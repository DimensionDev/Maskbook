import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Toolbar } from '../../../components/InjectedComponents/Toolbar'
import { ToolbarPlaceholder } from '../../../components/InjectedComponents/ToolbarPlaceholder'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { twitterUrl } from '../utils/url'

const main = new LiveSelector().querySelector('body > noscript')
const menuBlock = new LiveSelector().querySelector('[role="banner"] [role="heading"]')
const formBlock = new LiveSelector().querySelector('[data-testid="sidebarColumn"] form[role="search"]')

export function injectToolbarAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return

    // inject placeholder into left column
    const menuBlockWatcher = new MutationObserverWatcher(menuBlock.clone())
    startWatch(menuBlockWatcher)
    renderInShadowRoot(<ToolbarPlaceholder />, {
        shadow: () => menuBlockWatcher.firstDOMProxy.beforeShadow,
    })

    // inject toolbar
    const mainWatcher = new MutationObserverWatcher(main.clone())
    startWatch(mainWatcher)
    renderInShadowRoot(<Toolbar />, {
        shadow: () => mainWatcher.firstDOMProxy.beforeShadow,
    })

    // disable the original fixed layout of the right column
    new MutationObserverWatcher(formBlock.clone())
        .useForeach((node) => {
            const fixedContainer = (node as HTMLElement)?.parentElement?.parentElement?.parentElement?.parentElement
            const topFixedContainer = fixedContainer?.parentElement?.parentElement?.parentElement?.parentElement
            const placeholder = fixedContainer?.nextElementSibling as HTMLElement | undefined

            if (fixedContainer) fixedContainer.style.position = 'static'
            if (topFixedContainer) topFixedContainer.style.position = 'static'
            if (placeholder) placeholder.style.display = 'none'
        })
        .startWatch({
            subtree: true,
            childList: true,
        })
}
