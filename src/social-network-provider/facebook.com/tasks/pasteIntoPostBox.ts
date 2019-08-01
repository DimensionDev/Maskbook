import { LiveSelector, MutationObserverWatcher, IntervalWatcher } from '@holoflows/kit'
import { sleep, dispatchCustomEvents, timeout, untilDocumentReady } from '../../../utils/utils'
import { geti18nString } from '../../../utils/i18n'
import { isMobile } from '../isMobile'

/**
 * Access: https://(www|m).facebook.com/
 * @param text
 */
export async function pasteIntoPostBoxFacebook(text: string, warningText: string) {
    await untilDocumentReady()
    const scrolling = document.scrollingElement || document.documentElement
    const scroll = (top => () => scrolling.scroll({ top }))(scrolling.scrollTop)
    const dialog = new LiveSelector().querySelector<HTMLDivElement>('[role=main] [role=dialog]')
    const notActivated = new LiveSelector()
        .querySelector(`[role="region"]`)
        .querySelector('textarea, [aria-multiline="true"]')
        .closest<HTMLDivElement>(1)
    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobile ? 'form textarea' : '.notranslate',
    )
    await sleep(1000)
    // If page is just loaded
    if (isMobile === false && !activated.evaluateOnce()[0]) {
        try {
            console.log('Awaiting to click the post box')
            const [dom1] = await timeout(new MutationObserverWatcher(notActivated), 1000)
            dom1.click()
            console.log('Non-activated post box found Stage 1', dom1)
            const [dom2] = await timeout(new IntervalWatcher(notActivated.clone().filter(x => x !== dom1)), 3000)
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
        if (!isMobile) {
            await timeout(new MutationObserverWatcher(dialog), 4000)
            console.log('Dialog appeared')
        }
        const [element] = activated.evaluateOnce()
        element.focus()
        await sleep(100)
        if (isMobile) {
            dispatchCustomEvents('input', text)
        } else {
            dispatchCustomEvents('paste', text)
        }
        await sleep(400)
        if (isMobile) {
            const e = document.querySelector<HTMLDivElement>('.mentions-placeholder')
            if (e) e.style.display = 'none'
            copyFailed()
        } else {
            // Prevent Custom Paste failed, this will cause service not available to user.
            if (element.innerText.indexOf(text) === -1) {
                copyFailed()
            }
        }
    } catch {
        copyFailed()
    }
    scroll()
    function copyFailed() {
        console.warn('Text not pasted to the text area')
        prompt(warningText, text)
    }
}
