import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { querySelector } from '../../utils/selectors.js'
import { TipsButtonWrapper } from './TipsButtonWrapper.js'

function selector() {
    const authorWallet = location.pathname.split('/')[1].toLowerCase()
    return querySelector(`#__next a[href$="/address/${authorWallet}" i] div:nth-child(2)`)
}

export function injectOnVerification(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <DefaultWeb3ContextProvider>
            <TipsButtonWrapper slot={Plugin.SiteAdaptor.TipsSlot.MirrorVerification} />
        </DefaultWeb3ContextProvider>,
    )
}
