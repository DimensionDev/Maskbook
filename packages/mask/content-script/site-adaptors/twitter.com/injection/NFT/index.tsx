import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarInTwitter } from './NFTAvatarInTwitter.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { searchTwitterAvatarSelector } from '../../utils/selector.js'
import { startWatch } from '../../../../utils/startWatch.js'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const defaultWatcher = new MutationObserverWatcher(searchTwitterAvatarSelector()).useForeach((ele, _, proxy) => {
        const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
        root.render(<NFTAvatarInTwitter />)
        return () => root.destroy()
    })
    startWatch(defaultWatcher, signal)
}
