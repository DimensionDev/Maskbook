import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { querySelector } from '../../utils/selectors.js'
import { TipsButtonWrapper } from './TipsButtonWrapper.js'

function selector() {
    return querySelector(
        [
            'div:has(> div > button[data-state="closed"]) a', // More reliable
            '.GlobalNavigation a[href="/"]',
            'div[style$="height: 56px;"] a',
        ].join(','),
    )
}

export function injectOnMenu(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <EVMWeb3ContextProvider>
            <TipsButtonWrapper slot={Plugin.SiteAdaptor.TipsSlot.MirrorMenu} />
        </EVMWeb3ContextProvider>,
    )
}
