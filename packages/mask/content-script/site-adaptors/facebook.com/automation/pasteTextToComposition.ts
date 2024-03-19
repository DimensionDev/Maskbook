import { LiveSelector } from '@dimensiondev/holoflows-kit'
import type { SiteAdaptorUI } from '@masknet/types'
import { inputText, pasteText } from '@masknet/injected-script'
import { delay, waitDocumentReadyState } from '@masknet/kit'
import { MaskMessages } from '@masknet/shared-base'

/**
 * Access: https://(www|m).facebook.com/
 */
export async function pasteTextToCompositionFacebook(
    text: string,
    options: SiteAdaptorUI.AutomationCapabilities.NativeCompositionAttachTextOptions,
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
        'div[role=presentation] .notranslate[role=textbox]',
    )

    // Select element with fb customize background image.
    const activatedCustom = new LiveSelector().querySelectorAll<HTMLDivElement | HTMLTextAreaElement>(
        '.notranslate[aria-label]',
    )

    activatedCustom.filter((x) => x.parentElement?.parentElement?.parentElement?.parentElement?.hasAttribute('style'))

    const element = activated.evaluate()[0] ?? activatedCustom.evaluate()[0]
    try {
        element.focus()
        await delay(100)

        const selection = window.getSelection()
        if (selection) {
            if (selection.rangeCount > 0) {
                selection.removeAllRanges()
            }
            if (element.firstChild) {
                const range = document.createRange()
                range.selectNode(element.firstChild)
                selection.addRange(range)
            }
        }
        if ('value' in document.activeElement!) inputText(text)
        else pasteText(text)
        await delay(200)
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
