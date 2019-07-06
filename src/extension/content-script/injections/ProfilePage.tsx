import Services from '../../service'
import { PersonIdentifier } from '../../../database/type'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'

//#region Find key from bio
{
    const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
    function tryFindBioKey(text: string) {
        const a = document.querySelector<HTMLAnchorElement>('#fb-timeline-cover-name a')
        if (!text || !a) return
        const id = a.href.match(/profile\.php\?id=(.+)/)
        const name = a.href.match(/^https:..\.facebook.com\/(.+)/)
        if (!id && !name) return
        const username = id ? id[1] : name![1]
        Services.Crypto.verifyOthersProve(text, new PersonIdentifier('facebook.com', username))
    }
    new MutationObserverWatcher(bio)
        .enableSingleMode()
        .useForeach(node => {
            tryFindBioKey(node.current.innerText)
            return {
                onNodeMutation() {
                    tryFindBioKey(node.current.innerText)
                },
                onTargetChanged() {
                    tryFindBioKey(node.current.innerText)
                },
            }
        })
        .startWatch()
}
//#endregion

//#region Detech if friend
{
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
    // new MutationObserverWatcher(isFriend)
    //     .useForeach(status => {
    //         console.log(`You and this person is ${Status[status]}`)
    //         return {
    //             onTargetChanged() {
    //                 console.log(`target changed ${Status[status]}`)
    //             },
    //             onRemove() {
    //                 console.log(`on remove ${Status[status]}`)
    //             },
    //         }
    //     })
    //     .startWatch()
}
//#endregion
