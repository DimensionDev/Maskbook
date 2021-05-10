import { IntervalWatcher, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { dispatchCustomEvents, delay, timeout } from '../../../utils/utils'
import { isMobileFacebook } from '../utils/isMobile'
import type { SocialNetworkUI } from '../../../social-network/types'
import { untilDocumentReady } from '../../../utils/dom'
import { MaskMessage } from '../../../utils/messages'

async function openPostDialogFacebook() {
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
                await delay(1000)
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
    await delay(500)
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
export async function pasteTextToCompositionFacebook(
    text: string,
    options: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachTextOptions,
) {
    const { recover } = options
    await untilDocumentReady()
    // Save the scrolling position
    const scrolling = document.scrollingElement || document.documentElement
    const scrollBack = (
        (top) => () =>
            scrolling.scroll({ top })
    )(scrolling.scrollTop)

    const activated = new LiveSelector().querySelectorAll<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '.notranslate[aria-describedby]',
    )
    if (isMobileFacebook) activated.filter((x) => x.getClientRects().length > 0)
    // If page is just loaded
    // if (shouldOpenPostDialog) {
    //     await openPostDialogFacebook()
    // }
    try {
        const [element] = activated.evaluate()
        element.focus()
        await delay(100)
        if ('value' in document.activeElement!) dispatchCustomEvents(element, 'input', text)
        else dispatchCustomEvents(element, 'paste', text)
        await delay(400)
        if (isMobileFacebook) {
            const e = document.querySelector<HTMLDivElement | HTMLTextAreaElement>('.mentions-placeholder')
            if (e) e.style.display = 'none'
        }
        // Prevent Custom Paste failed, this will cause service not available to user.
        if (element.innerText.indexOf(text) === -1 || ('value' in element && element.value.indexOf(text) === -1))
            copyFailed('Not detected')
    } catch (e) {
        copyFailed(e)
    }
    scrollBack()
    function copyFailed(e: any) {
        console.warn('Text not pasted to the text area', e)
        if (recover) MaskMessage.events.autoPasteFailed.sendToLocal({ text })
    }
}
