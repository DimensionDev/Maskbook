import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import Services from '../../../extension/service'

function findPeopleInfo() {
    // TODO: support mobile
    const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
    new MutationObserverWatcher(bio)
        .enableSingleMode()
        .useForeach(node => {
            function tryFindBioKey() {
                const text = node.innerText
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
    // TODO: finish this, store it into the database
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
