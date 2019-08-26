import { IntervalWatcher, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { dispatchCustomEvents, sleep, timeout, untilDocumentReady } from '../../../utils/utils'
import { geti18nString } from '../../../utils/i18n'
import { isMobileFacebook } from '../isMobile'

/**
 * Access: https://(www|m).facebook.com/
 */
export async function pasteIntoPostBoxFacebook(text: string, warningText: string) {
    await untilDocumentReady()
    const scrolling = document.scrollingElement || document.documentElement
    const scroll = (top => () => scrolling.scroll({ top }))(scrolling.scrollTop)
    const notActivated = new LiveSelector()
        .querySelector(`[role="region"]`)
        .querySelector('textarea, [aria-multiline="true"]')
        .closest<HTMLDivElement>(1)
    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '[contenteditable="true"]',
    )
    await sleep(500)
    // If page is just loaded
    if (isMobileFacebook === false && !activated.evaluateOnce()[0]) {
        try {
            console.log('Awaiting to click the post box')
            const [dom1] = await timeout(new MutationObserverWatcher(notActivated), 1000)
            dom1.click()
            console.log('Non-activated post box found Stage 1', dom1)
            const [dom2] = await timeout(new IntervalWatcher(notActivated.clone().filter(x => x !== dom1)), 3000)
            console.log('Non-activated post box found Stage 2', dom2)
            dom2.click()
        } catch (e) {
            console.warn(e)
        }
    }
    await sleep(500)
    try {
        const [element] = activated.evaluateOnce()
        element.focus()
        await sleep(100)
        if (isMobileFacebook) {
            dispatchCustomEvents('input', text)
        } else {
            dispatchCustomEvents('paste', text)
        }
        await sleep(400)
        if (isMobileFacebook) {
            const e = document.querySelector<HTMLDivElement | HTMLTextAreaElement>('.mentions-placeholder')
            if (e) e.style.display = 'none'
        }
        // Prevent Custom Paste failed, this will cause service not available to user.
        if (element.innerText.indexOf(text) === -1 && 'value' in element && element.value.indexOf(text) === -1) {
            copyFailed()
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
