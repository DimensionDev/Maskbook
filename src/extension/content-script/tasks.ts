import { AutomatedTabTask, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { BackgroundService } from './rpc'
export default AutomatedTabTask({
    /**
     * Access: https://www.facebook.com/${username}/posts/${postId}
     * Or: https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${userId}
     */
    getPostContent() {
        const post = new LiveSelector().querySelector<HTMLParagraphElement>('#contentArea p').map(x => x.innerText)
        return new Promise(resolve => {
            new MutationObserverWatcher(post).addListener('onAdd', event => resolve(event.data[0].node)).startWatch()
        })
    },
    /**
     * Access: https://www.facebook.com/profile.php?id=${userId}
     * Or: https://www.facebook.com/${username}?fref=pymk
     */
    getBioContent() {
        const bio = new LiveSelector()
            .querySelector<HTMLDivElement>('#profile_timeline_intro_card')
            .map(x => x.innerText)
        return new Promise(resolve =>
            new MutationObserverWatcher(bio).addListener('onAdd', event => resolve(event.data[0].node)).startWatch(),
        )
    },
})!
