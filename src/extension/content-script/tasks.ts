import { AutomatedTabTask, LiveSelector, MutationObserverWatcher, IntervalWatcher } from '@holoflows/kit'
import { sleep, dispatchCustomEvents, timeout, untilDocumentReady } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { fetchFacebookProvePost } from '../../social-network/facebook.com/fetch-prove-post'
import { PersonIdentifier, PostIdentifier } from '../../database/type'
import { fetchFacebookBio } from '../../social-network/facebook.com/fetch-bio'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
/**
 * Access: https://(www|m).facebook.com/
 * @param text
 */
export async function pasteIntoPostBox(text: string, warningText: string) {
    await untilDocumentReady()
    const scrolling = document.scrollingElement || document.documentElement
    const scroll = (top => () => scrolling.scroll({ top }))(scrolling.scrollTop)

    const dialog = new LiveSelector().querySelector<HTMLDivElement>('[role=main] [role=dialog]')
    const notActivated = new LiveSelector()
        .querySelector(`[role="region"]`)
        .querySelector('textarea, [aria-multiline="true"]')
        .closest<HTMLDivElement>(1)
    const activated = new LiveSelector().querySelector<HTMLDivElement>('.notranslate')
    await sleep(2000)
    // If page is just loaded
    if (!activated.evaluateOnce()[0]) {
        try {
            console.log('Awaiting to click the post box')
            const [dom1] = await timeout(new MutationObserverWatcher(notActivated).await(), 1000)
            dom1.click()
            console.log('Non-activated post box found Stage 1', dom1)
            const [dom2] = await timeout(
                new IntervalWatcher(notActivated.clone().filter(x => x !== dom1)).await(),
                3000,
            )
            console.log('Non-activated post box found Stage 2', dom2)
            dom2.click()
            if (!dialog.evaluateOnce()[0]) throw new Error('Click not working')
        } catch (e) {
            console.warn(e)
            if (!dialog.evaluateOnce()[0]) alert(geti18nString('automation_request_click_post_box'))
        }
        console.log('Awaiting dialog')
    }

    try {
        await timeout(new MutationObserverWatcher(dialog).await(), 4000)
        console.log('Dialog appeared')
        const [element] = activated.evaluateOnce()
        element.focus()
        await sleep(100)
        dispatchCustomEvents('paste', text)
        await sleep(400)

        // Prevent Custom Paste failed, this will cause service not available to user.
        if (element.innerText.indexOf(text) === -1) {
            copyFailed()
        }
    } catch {
        copyFailed()
    }

    scroll()

    function copyFailed() {
        console.warn('Text not pasted to the text area')
        navigator.clipboard.writeText(text)
        alert(warningText)
    }
}
export default AutomatedTabTask(
    {
        /**
         * Access post url
         * Get post content
         */
        getPostContent(identifier: PostIdentifier<PersonIdentifier>) {
            return fetchFacebookProvePost(identifier)
            // const post = new LiveSelector().querySelector('#contentArea').getElementsByTagName('p')
            // const [data] = await new MutationObserverWatcher(post).await(node => node.innerText)
            // return data
        },
        /**
         * Access profile page
         * Get bio content
         */
        getBioContent(identifier: PersonIdentifier) {
            return fetchFacebookBio(identifier)
            // const [data] = await new MutationObserverWatcher(bioCard).await(node => node.innerText)
            // return data
        },
        /**
         * Access profile page
         * Paste text into bio
         */
        async pasteIntoBio(text: string) {
            await sleep(1000)
            try {
                const pencil = new MutationObserverWatcher(
                    bioCard.clone().querySelector<HTMLAnchorElement>('[data-tooltip-content][href="#"]'),
                ).await()
                const edit = new MutationObserverWatcher(
                    bioCard.clone().querySelector<HTMLButtonElement>('button[type="submit"]'),
                ).await()
                const [bioEditButton] = await timeout(Promise.race([pencil, edit]), 2000)
                await sleep(200)
                bioEditButton.click()
            } catch {
                alert(geti18nString('automation_request_click_edit_bio_button'))
            }

            await sleep(400)

            try {
                const [input] = await timeout(
                    new MutationObserverWatcher(bioCard.clone().getElementsByTagName('textarea')).await(),
                    2000,
                )
                await sleep(200)
                input.focus()
                dispatchCustomEvents('input', input.value + text)
            } catch {
                console.warn('Text not pasted to the text area')
                navigator.clipboard.writeText(text)
                alert(geti18nString('automation_request_paste_into_bio_box'))
            }
        },
        pasteIntoPostBox,
    },
    { memorable: true },
)!
