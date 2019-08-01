import { AutomatedTabTask, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { sleep, dispatchCustomEvents, timeout } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { getActivatedUI } from '../../social-network/ui'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
export default AutomatedTabTask(
    {
        /**
         * Access post url
         * Get post content
         */
        getPostContent: getActivatedUI().taskGetPostContent,
        /**
         * Access profile page
         * Get Profile
         */
        getProfile: getActivatedUI().taskGetProfile,
        /**
         * Access profile page
         * Paste text into bio
         */
        async pasteIntoBio(text: string) {
            await sleep(1000)
            try {
                const pencil = new MutationObserverWatcher(
                    bioCard.clone().querySelector<HTMLAnchorElement>('[data-tooltip-content][href="#"]'),
                )
                const edit = new MutationObserverWatcher(
                    bioCard.clone().querySelector<HTMLButtonElement>('button[type="submit"]'),
                )
                const [bioEditButton] = await timeout(Promise.race([pencil, edit]), 2000)
                await sleep(200)
                bioEditButton.click()
            } catch {
                alert(geti18nString('automation_request_click_edit_bio_button'))
            }

            await sleep(400)

            try {
                const [input] = await timeout(
                    new MutationObserverWatcher(bioCard.clone().getElementsByTagName('textarea')),
                    2000,
                )
                await sleep(200)
                input.focus()
                dispatchCustomEvents('input', input.value + text)
            } catch {
                console.warn('Text not pasted to the text area')
                prompt(geti18nString('automation_request_paste_into_bio_box'), text)
            }
        },
        pasteIntoPostBox: getActivatedUI().taskPasteIntoPostBox,
    },
    { memorable: true },
)!
