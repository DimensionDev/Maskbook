import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchProfileCoverSelector } from '../utils/selector.js'
import { createReactRootShadowed, startWatch } from '../../../utils/index.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'

export function injectProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileCoverSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtTwitter />)
}

export function ProfileCoverAtTwitter() {
    return <ProfileCover />
}
