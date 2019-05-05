import { AutomatedTabTask, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
export default AutomatedTabTask(
    {
        /**
         * Access: https://www.facebook.com/${username}/posts/${postId}
         * Or: https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${userId}
         */
        async getPostContent() {
            const post = new LiveSelector().querySelector<HTMLParagraphElement>('#contentArea p')
            const [data] = await new MutationObserverWatcher(post).once(node => node.innerText)
            return data
        },
        /**
         * Access: https://www.facebook.com/profile.php?id=${userId}
         * Or: https://www.facebook.com/${username}?fref=pymk
         */
        async getBioContent() {
            const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
            const [data] = await new MutationObserverWatcher(bio).once(node => node.innerText)
            return data
        },
    },
    { memorable: true },
)!
