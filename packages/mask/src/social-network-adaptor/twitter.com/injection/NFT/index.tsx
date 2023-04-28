import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarInTwitter } from './NFTAvatarInTwitter.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import {
    searchTwitterAvatarNFTLinkSelector,
    searchTwitterAvatarNFTSelector,
    searchTwitterAvatarNormalSelector,
    searchTwitterAvatarSelector,
    searchTwitterSquareAvatarSelector,
} from '../../utils/selector.js'
import { NFTAvatarClipInTwitter } from './NFTAvatarClip.js'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const squareWatcher = new MutationObserverWatcher(
        searchTwitterAvatarNormalSelector().evaluate()
            ? searchTwitterAvatarNormalSelector().querySelector('div img')
            : searchTwitterSquareAvatarSelector(),
    ).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        if (searchTwitterAvatarNormalSelector().evaluate()) root.render(<NFTAvatarInTwitter />)
        return () => root.destroy()
    })
    startWatch(squareWatcher, signal)

    const defaultWatcher = new MutationObserverWatcher(searchTwitterAvatarSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        if (searchTwitterAvatarNormalSelector().evaluate()) root.render(<NFTAvatarInTwitter />)
        return () => root.destroy()
    })
    startWatch(defaultWatcher, signal)

    const clipWatcher = new MutationObserverWatcher(searchTwitterAvatarNFTSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        if (searchTwitterAvatarNFTLinkSelector().evaluate()) root.render(<NFTAvatarClipInTwitter />)
        return () => root.destroy()
    })
    startWatch(clipWatcher, signal)
}
