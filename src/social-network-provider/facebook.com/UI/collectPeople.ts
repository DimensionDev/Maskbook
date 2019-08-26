import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import Services from '../../../extension/service'

function findPeopleInfo() {
    // TODO: support mobile
    const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
    new MutationObserverWatcher(bio)
        .enableSingleMode()
        /**
         * @var node: bio in the side of user page
         */
        .useForeach(node => {
            function tryFindBioKey() {
                /**
                 * @var text
                 * @example
                 * "...r Xoogler, MaskBook: A80TOj...eW9yqf
                 * Google - Softwa..."
                 */
                const text = node.innerText

                /**
                 * Also collect 'identifier' | 'nickname' | 'avatar'
                 */
                const a = document.querySelector<HTMLAnchorElement>('#fb-timeline-cover-name a')
                const id = getPersonIdentifierAtFacebook(a, true)
                if (!id) return
                Services.Crypto.verifyOthersProve(text, id.identifier)
            }
            tryFindBioKey()
            return {
                onNodeMutation: tryFindBioKey,
                onTargetChanged: tryFindBioKey,
            }
        })
        .startWatch()
}
function detectIfFriend() {
    enum Status {
        Friend,
        Unknown,
        NonFriend,
    }
    /**
     * Ack:
     * If `#pagelet_timeline_profile_actions > * > *` have 4 children, they are not friend.
     * If have 6 children, they are friend.
     */
    const isFriend = new LiveSelector().querySelectorAll('#pagelet_timeline_profile_actions > * > *').replace(arr => {
        if (arr.length === 6) return [Status.Friend]
        else if (arr.length === 4) return [Status.NonFriend]
        return [Status.Unknown]
    })
    // TODO: finish this, store it into the database, also do this in twitter
    new MutationObserverWatcher(isFriend)
        .useForeach(() => {
            return {
                onTargetChanged() {},
                onRemove() {},
            }
        })
        .startWatch()
}

export function collectPeopleFacebook() {
    findPeopleInfo()
    detectIfFriend()
}
