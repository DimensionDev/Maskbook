import { abortSignalTimeout, delay } from '@dimensiondev/kit'
import { inputText, pasteText } from '@masknet/injected-script'
import { newPostButtonSelector, postEditorDraftContentSelector } from '../utils/selector'
import type { SocialNetworkUI } from '../../../social-network'
import { getEditorContent, hasEditor, hasFocus, isCompose } from '../utils/postBox'
import { untilElementAvailable } from '../../../utils/dom'
import { isMobileTwitter } from '../utils/isMobile'
import { MaskMessages } from '../../../utils/messages'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
export const pasteTextToCompositionTwitter: SocialNetworkUI.AutomationCapabilities.NativeCompositionDialog['appendText'] =
    (text, opt) => {
        const interval = 500
        const timeout = 5000
        const worker = async function (signal: AbortSignal) {
            if (!isCompose() && !hasEditor() && opt?.reason !== 'reply') {
                // open tweet window
                await untilElementAvailable(newPostButtonSelector())
                newPostButtonSelector().evaluate()!.click()
                signal.throwIfAborted()
                await delay(interval)
            }

            // get focus
            const i = postEditorDraftContentSelector()
            await untilElementAvailable(i)
            signal.throwIfAborted()
            while (!hasFocus(i)) {
                i.evaluate()!.focus()
                signal.throwIfAborted()
                await delay(interval)
            }
            // paste
            isMobileTwitter ? inputText(text) : pasteText(text)
            await delay(interval)
            if (!getEditorContent().replace(/\n/g, '').includes(text.replace(/\n/g, ''))) {
                fail(new Error('Unable to paste text automatically'))
            }
        }

        const fail = (e: Error) => {
            if (opt?.recover) MaskMessages.events.autoPasteFailed.sendToLocal({ text })
            throw e
        }

        worker(abortSignalTimeout(timeout)).then(undefined, (error) => fail(error))
    }
