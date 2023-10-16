import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookProfileCoverSelector } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover.js'

export function injectFacebookProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileCoverSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtFacebook />)
}

function ProfileCoverAtFacebook() {
    return <ProfileCover />
}
