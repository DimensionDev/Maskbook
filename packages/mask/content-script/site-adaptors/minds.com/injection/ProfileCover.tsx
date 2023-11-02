import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchMindsProfileCover } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'

export function injectMindsProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchMindsProfileCover())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtMinds />)
}

function ProfileCoverAtMinds() {
    return <ProfileCover />
}
