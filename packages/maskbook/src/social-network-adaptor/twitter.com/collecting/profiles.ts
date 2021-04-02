import { bioCardSelector } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { GroupIdentifier, PreDefinedVirtualGroupNames } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network'
import { bioCardParser } from '../utils/fetch'
import Services from '../../../extension/service'
import { IdentityProviderTwitter } from './identity'

export function profilesCollectorTwitter(signal: AbortSignal) {
    registerUserCollectorInner(IdentityProviderTwitter.lastRecognized, signal)
}
function registerUserCollectorInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['lastRecognized'],
    signal: AbortSignal,
) {
    const watcher = new MutationObserverWatcher(bioCardSelector())
        .useForeach((cardNode: HTMLDivElement) => {
            const resolve = async () => {
                if (!cardNode) return
                const { isFollower, isFollowing, identifier } = bioCardParser(cardNode)
                const myIdentity = await Services.Identity.queryProfile(ref.value.identifier)
                if (signal?.aborted) return
                const myFriends = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.friends,
                )
                const myFollowers = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.followers,
                )
                const myFollowing = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.following,
                )
                if (isFollower || isFollowing) {
                    if (isFollower) Services.UserGroup.addProfileToFriendsGroup(myFollowers, [identifier])
                    if (isFollowing) Services.UserGroup.addProfileToFriendsGroup(myFollowing, [identifier])
                    if (isFollower && isFollowing) Services.UserGroup.addProfileToFriendsGroup(myFriends, [identifier])
                } else Services.UserGroup.removeProfileFromFriendsGroup(myFriends, [identifier])
            }
            resolve()
            return {
                onNodeMutation: resolve,
                onTargetChanged: resolve,
            }
        })
        .startWatch({
            childList: true,
            subtree: true,
        })
    signal.addEventListener('abort', () => watcher.stopWatch())
}
