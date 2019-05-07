import { AutomatedTabTask, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { sleep, dispatchCustomEvents } from '../../utils/utils'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
export default AutomatedTabTask(
    {
        /**
         * Access: https://www.facebook.com/${username}/posts/${postId}
         * Or: https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${userId}
         */
        async getPostContent() {
            const post = new LiveSelector().querySelector('#contentArea').getElementsByTagName('p')
            const [data] = await new MutationObserverWatcher(post).once(node => node.innerText)
            return data
        },
        /**
         * Access: https://www.facebook.com/profile.php?id=${userId}
         * Or: https://www.facebook.com/${username}?fref=pymk
         */
        async getBioContent() {
            const [data] = await new MutationObserverWatcher(bioCard).once(node => node.innerText)
            return data
        },
        /**
         * Access: https://www.facebook.com/profile.php?id=${userId}
         * Or: https://www.facebook.com/${username}?fref=pymk
         */
        async verifyBio(text: string) {
            const [bioEditButton] = await new MutationObserverWatcher(
                bioCard.clone().querySelector<HTMLAnchorElement>('[data-tooltip-content][href="#"]'),
            ).once()
            await sleep(200)
            bioEditButton.click()

            const [input] = await new MutationObserverWatcher(bioCard.clone().getElementsByTagName('textarea')).once()
            await sleep(200)
            input.focus()
            dispatchCustomEvents('input', input.value + text)
        },
    },
    { memorable: true },
)!
