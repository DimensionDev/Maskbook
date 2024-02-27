import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchProfileCoverSelector } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'

export function injectProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileCoverSelector())
    startWatch(watcher, {
        signal,
    })
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtTwitter />)
}

function ProfileCoverAtTwitter() {
    return <ProfileCover />
}
