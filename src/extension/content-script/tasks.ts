import { AutomatedTabTask, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { sleep, dispatchCustomEvents, selectElementContents } from '../../utils/utils'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
/**
 * Access: https://www.facebook.com/
 * @param text
 */
export async function pasteIntoPostBox(text: string, warningText: string) {
    const scrolling = document.scrollingElement || document.documentElement
    const scroll = (top => () => scrolling.scroll({ top }))(scrolling.scrollTop)

    const notActivated = new LiveSelector().querySelector(`[role="region"]`).querySelector('textarea')
    const activated = new LiveSelector().querySelector<HTMLDivElement>('.notranslate')
    // If page is just loaded
    if (!activated.evaluateOnce()[0]) {
        const [dom] = await new MutationObserverWatcher(notActivated).once()
        dom.click()
        await sleep(1500)
        await new MutationObserverWatcher(activated.clone().unstable_closest(`[role="dialog"]`)).once()
    }
    const [element] = activated.evaluateOnce()
    element.focus()
    await sleep(100)
    dispatchCustomEvents('paste', text)
    await sleep(400)
    // Prevent Custom Paste failed, this will cause service not available to user.
    if (element.innerText.indexOf(text) === -1) {
        console.warn('Text not pasted to the text area')
        navigator.clipboard.writeText(text)
        alert(warningText)
    }

    scroll()
}
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
        async pasteIntoBio(text: string) {
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
        pasteIntoPostBox,
    },
    { memorable: true },
)!
