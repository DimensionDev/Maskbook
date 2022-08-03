import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchProfileCoverSelector } from '../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover'

export function injectProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileCoverSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtTwitter />)
}

export function ProfileCoverAtTwitter() {
    return <ProfileCover />
}
