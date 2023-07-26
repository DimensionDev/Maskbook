import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchMindsProfileCover } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/index.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'
import { startWatch } from '@masknet/theme'

export function injectMindsProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchMindsProfileCover())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtMinds />)
}

export function ProfileCoverAtMinds() {
    return <ProfileCover />
}
