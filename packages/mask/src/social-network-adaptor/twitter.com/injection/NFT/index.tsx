import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getInjectedDom } from '../../utils/AvatarType.js'
import { NFTAvatarInTwitter } from './NFTAvatarInTwitter.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { searchTwitterAvatarNFTLinkSelector, searchTwitterAvatarNormalSelector } from '../../utils/selector.js'
import { NFTAvatarClipInTwitter } from './NFTAvatarClip.js'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(getInjectedDom()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })

        if (searchTwitterAvatarNormalSelector().evaluate()) root.render(<NFTAvatarInTwitter />)
        if (searchTwitterAvatarNFTLinkSelector().evaluate()) root.render(<NFTAvatarClipInTwitter />)
        return () => root.destroy()
    })
    startWatch(watcher, signal)
}
