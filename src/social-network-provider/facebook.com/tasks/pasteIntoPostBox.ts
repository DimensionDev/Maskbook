import { IntervalWatcher, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { dispatchCustomEvents, sleep, timeout } from '../../../utils/utils'
import { isMobileFacebook } from '../isMobile'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'

export async function openPostDialogFacebook() {
    await untilDocumentReady()
    const notActivated = isMobileFacebook
        ? new LiveSelector().querySelector<HTMLDivElement>('[role="textbox"]')
        : new LiveSelector()
              .querySelector(`[role="region"]`)
              .querySelector('textarea, [aria-multiline="true"]')
              .closest<HTMLDivElement>(1)
    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '.notranslate',
    )
    const dialog = new LiveSelector().querySelector<HTMLDivElement>('[role=main] [role=dialog]')
    if (notActivated.evaluate()[0]) {
        if (isMobileFacebook) {
            try {
                notActivated.evaluate()[0].click()
                await timeout(new MutationObserverWatcher(activated), 2000)
                await sleep(1000)
            } catch (e) {
                clickFailed(e)
            }
        } else {
            try {
                console.log('Awaiting to click the post box')
                const [dom1] = await timeout(new MutationObserverWatcher(notActivated), 1000)
                dom1.click()
                console.log('Non-activated post box found Stage 1', dom1)
                const [dom2] = await timeout(new IntervalWatcher(notActivated.clone().filter((x) => x !== dom1)), 3000)
                console.log('Non-activated post box found Stage 2', dom2)
                dom2.click()
                await timeout(new MutationObserverWatcher(activated), 1000)
                if (!dialog.evaluate()[0]) throw new Error('Click not working')
            } catch (e) {
                clickFailed(e)
            }
            console.log('Awaiting dialog')
        }
    }
    await sleep(500)
    try {
        await timeout(new MutationObserverWatcher(isMobileFacebook ? activated : dialog), 2000)
        console.log('Dialog appeared')
    } catch {}
    function clickFailed(e: unknown) {
        console.warn(e)
        if (!dialog.evaluate()[0]) alert('请点击输入框')
    }
}

/**
 * Access: https://(www|m).facebook.com/
 */
export async function pasteIntoPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1],
) {
    const { shouldOpenPostDialog, warningText } = options
    await untilDocumentReady()
    // Save the scrolling position
    const scrolling = document.scrollingElement || document.documentElement
    const scrollBack = ((top) => () => scrolling.scroll({ top }))(scrolling.scrollTop)

    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '.notranslate',
    )
    // If page is just loaded
    if (shouldOpenPostDialog) {
        await openPostDialogFacebook()
        console.log('Awaiting dialog')
    }
    try {
        const [element] = activated.evaluate()
        element.focus()
        await sleep(100)
        if ('value' in document.activeElement!) dispatchCustomEvents('input', text)
        else dispatchCustomEvents('paste', text)
        element.dispatchEvent(new CustomEvent('input', { bubbles: true, cancelable: false, composed: true }))
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
    scrollBack()
    function copyFailed() {
        console.warn('Text not pasted to the text area')
        prompt(warningText, text)
    }
}
