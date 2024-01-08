import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { Mirror } from '@masknet/web3-providers'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { querySelector } from '../../utils/selectors.js'
import { getAuthorWallet } from '../../utils/user.js'
import { TipsButtonWrapper } from './TipsButtonWrapper.js'

async function selector() {
    let authorWallet = getAuthorWallet()
    if (authorWallet.endsWith('.eth')) {
        const digest = location.pathname.split('/').pop()
        const publisher = await Mirror.getPostPublisher(digest!)
        authorWallet = publisher?.author.address || authorWallet
    }
    return querySelector(`#__next a[href$="/address/${authorWallet}" i] div:nth-child(2)`)
}

export async function injectOnVerification(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(await selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <EVMWeb3ContextProvider>
            <TipsButtonWrapper slot={Plugin.SiteAdaptor.TipsSlot.MirrorVerification} />
        </EVMWeb3ContextProvider>,
    )
}
