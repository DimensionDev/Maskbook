import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Toolbar } from '../../../components/InjectedComponents/Toolbar'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'

const root = new LiveSelector().querySelector('#react-root')

export function injectToolbarAtFacebook() {
    const watcher = new MutationObserverWatcher(root.clone())
    startWatch(watcher)
    renderInShadowRoot(<ToolbarAtFacebook />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        rootProps: {
            style: {},
        },
    })
}

function ToolbarAtFacebook() {
    return <Toolbar />
}
