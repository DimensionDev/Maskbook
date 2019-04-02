import { AutomatedTabTask, LiveSelector } from '@holoflows/kit'
import { sleep } from '../../utils/utils'
export default AutomatedTabTask({
    /**
     * Access: https://www.facebook.com/${username}/posts/${postId}
     * Or: https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${userId}
     */
    async getPostContent() {
        const post = new LiveSelector().querySelector<HTMLParagraphElement>('#contentArea p')
        while (!post.evaluateOnce()[0]) await sleep(200)
        return post.evaluateOnce()[0].innerText
    },
    /**
     * Access: https://www.facebook.com/profile.php?id=${userId}
     * Or: https://www.facebook.com/${username}?fref=pymk
     */
    async getBioContent() {
        const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
        while (!bio.evaluateOnce()[0]) await sleep(200)
        return bio.evaluateOnce()[0].innerText
    },
})!
