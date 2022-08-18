import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchMindsProfileCover } from '../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover'

export function injectMindsProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchMindsProfileCover())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtMinds />)
}

export function ProfileCoverAtMinds() {
    return <ProfileCover />
}
