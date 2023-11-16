import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { querySelector } from '../../utils/selectors.js'
import { TipsButtonWrapper } from './TipsButtonWrapper.js'

function selector() {
    const authorWallet = location.pathname.split('/')[1].toLowerCase()
    // Only the address link
    return querySelector(
        [
            `#__next div:has(h2) ~ div a[href$="/address/${authorWallet}" i]`, // address
            `#__next div:has(h2) ~ div a[href$="search=${authorWallet}" i]`, // ENS
        ].join(','),
    )
}

export function injectTipsButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <EVMWeb3ContextProvider>
            <TipsButtonWrapper slot={Plugin.SiteAdaptor.TipsSlot.MirrorVerification} />
        </EVMWeb3ContextProvider>,
    )
}
