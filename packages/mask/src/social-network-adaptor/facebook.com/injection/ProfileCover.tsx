import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookProfileCoverSelector } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/index.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'
import { startWatch } from '@masknet/theme'

export function injectFacebookProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileCoverSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtFacebook />)
}

export function ProfileCoverAtFacebook() {
    return <ProfileCover />
}
