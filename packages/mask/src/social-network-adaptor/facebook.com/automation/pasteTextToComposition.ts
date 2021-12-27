import { IntervalWatcher, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { delay, timeout } from '@masknet/shared-base'
import { isMobileFacebook } from '../utils/isMobile'
import type { SocialNetworkUI } from '../../../social-network/types'
import { untilDocumentReady } from '../../../utils/dom'
import { MaskMessages } from '../../../utils/messages'
import { inputText, pasteText } from '@masknet/injected-script'

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
            } catch (error) {
                clickFailed(error)
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
            } catch (error) {
                clickFailed(error)
            }
            console.log('Awaiting dialog')
        }
    }
    await delay(500)
    try {
        await timeout(new MutationObserverWatcher(isMobileFacebook ? activated : dialog), 2000)
        console.log('Dialog appeared')
    } catch {
        // ignore
    }
    function clickFailed(error: unknown) {
        console.warn(error)
        if (!dialog.evaluate()[0]) alert('Click the input box, please.')
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
        isMobileFacebook ? 'form textarea' : 'div[role=presentation] .notranslate[aria-describedby]',
    )
    if (isMobileFacebook) activated.filter((x) => x.getClientRects().length > 0)

    // Select element with fb customize background image.
    const activatedCustom = new LiveSelector().querySelectorAll<HTMLDivElement | HTMLTextAreaElement>(
        '.notranslate[aria-label]',
    )

    activatedCustom.filter((x) => x.parentElement?.parentElement?.parentElement?.parentElement?.hasAttribute('style'))

    const element = activated.evaluate()[0] ?? activatedCustom.evaluate()[0]
    try {
        element.focus()
        await delay(100)
        if ('value' in document.activeElement!) inputText(text)
        else pasteText(text)
        await delay(400)
        if (isMobileFacebook) {
            const e = document.querySelector<HTMLDivElement | HTMLTextAreaElement>('.mentions-placeholder')
            if (e) e.style.display = 'none'
        }
        // Prevent Custom Paste failed, this will cause service not available to user.
        if (!element.innerText.includes(text) || ('value' in element && !element.value.includes(text)))
            copyFailed('Not detected')
    } catch (error) {
        copyFailed(error)
    }
    scrollBack()
    function copyFailed(error: unknown) {
        console.warn('Text not pasted to the text area', error)
        if (recover) MaskMessages.events.autoPasteFailed.sendToLocal({ text })
    }
}
