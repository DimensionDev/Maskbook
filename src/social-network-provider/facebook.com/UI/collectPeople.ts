import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { getProfileIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import Services from '../../../extension/service'
import { GroupIdentifier } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network/ui'

function findPeopleInfo(whoAmI: SocialNetworkUI['currentIdentity']) {
    // TODO: support mobile
    const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card').enableSingleMode()
    new MutationObserverWatcher(bio)
        /**
         * @var node: bio in the side of user page
         */
        .useForeach((node) => {
            function tryFindBioKey() {
                /**
                 * @var text
                 * @example
                 * "...r Xoogler, MaskBook: A80TOj...eW9yqf Google - Softwa..."
                 */
                const text = node.innerText

                /**
                 * Also collect 'identifier' | 'nickname' | 'avatar'
                 */
                const a = document.querySelector<HTMLAnchorElement>('#fb-timeline-cover-name a')
                // side effect: save to service
                const id = getProfileIdentifierAtFacebook(a, true)
                if (!id) return
                Services.Crypto.verifyOthersProve(text, id.identifier)
                return id
            }
            function parseFriendship() {
                const thisPerson = tryFindBioKey()
                const myID = whoAmI.value
                if (!thisPerson || !myID) return
                const [isFriendNow] = isFriend.evaluate()
                const myFriends = GroupIdentifier.getDefaultFriendsGroupIdentifier(myID.identifier)
                if (isFriendNow === Status.Friend) {
                    Services.UserGroup.addProfileToFriendsGroup(myFriends, [thisPerson.identifier])
                    console.log('Adding friend', thisPerson.identifier, 'to', myFriends)
                } else if (isFriendNow === Status.NonFriend) {
                    Services.UserGroup.removeProfileFromFriendsGroup(myFriends, [thisPerson.identifier])
                    console.log('Removing friend', thisPerson.identifier, 'from', myFriends)
                }
            }
            whoAmI.addListener(parseFriendship)
            parseFriendship()
            return {
                onNodeMutation: parseFriendship,
                onTargetChanged: parseFriendship,
            }
        })
        .startWatch({
            childList: true,
            subtree: true,
        })
}
enum Status {
    NonFriend = 1,
    Friend = 2,
    Unknown = 3,
}
/**
 * Ack:
 * If `#pagelet_timeline_profile_actions button:not(.hidden_elem)` have 3 nodes, they are friend.
 * If have 2 children, they are not friend.
 */
const isFriend = new LiveSelector()
    .querySelectorAll('#pagelet_timeline_profile_actions button:not(.hidden_elem)')
    .replace((arr) => {
        if (arr.length === 3) return [Status.Friend]
        else if (arr.length === 2) return [Status.NonFriend]
        return [Status.Unknown]
    })

export function collectPeopleFacebook(this: SocialNetworkUI) {
    findPeopleInfo(this.currentIdentity)
}
