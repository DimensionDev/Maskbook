import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { isMobileFacebook } from '../utils/isMobile'
import type { SocialNetworkUI } from '../../../social-network/types'
import { MaskMessages } from '../../../utils/messages'
import { inputText, pasteText } from '@masknet/injected-script'
import { delay, waitDocumentReadyState } from '@dimensiondev/kit'

/**
 * Access: https://(www|m).facebook.com/
 */
export async function pasteTextToCompositionFacebook(
    text: string,
    options: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachTextOptions,
) {
    const { recover } = options
    await waitDocumentReadyState('interactive')
    // Save the scrolling position
    const scrolling = document.scrollingElement || document.documentElement
    const scrollBack = (
        (top) => () =>
            scrolling.scroll({ top })
    )(scrolling.scrollTop)

    const activated = new LiveSelector().querySelectorAll<HTMLDivElement | HTMLTextAreaElement>(
        // cspell:disable-next-line
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
