import { bioCardSelector } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { GroupIdentifier, PreDefinedVirtualGroupNames } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { bioCardParser } from '../utils/fetch'
import Services from '../../../extension/service'

export function registerUserCollector(self: SocialNetworkUI) {
    new MutationObserverWatcher(bioCardSelector())
        .useForeach((cardNode: HTMLDivElement) => {
            const resolve = async () => {
                if (!cardNode) return
                const { isFollower, isFollowing, identifier } = bioCardParser(cardNode)
                const ref = self.lastRecognizedIdentity
                if (!ref) return
                const myIdentity = await Services.Identity.queryProfile(self.lastRecognizedIdentity.value.identifier)
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
}
