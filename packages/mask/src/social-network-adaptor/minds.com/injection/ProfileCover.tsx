import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchMindsProfileCover } from '../utils/selector.js'
import { attachReactTreeWithContainer, startWatch } from '../../../utils/index.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'

export function injectMindsProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchMindsProfileCover())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtMinds />)
}

export function ProfileCoverAtMinds() {
    return <ProfileCover />
}
