import type { SocialNetworkUI } from '../../../social-network'
import { untilElementAvailable } from '../../../utils/dom'
import { MaskMessages } from '../../../utils/messages'
import { selectElementContents } from '../../../utils/utils'
import { abortSignalTimeout, delay } from '@dimensiondev/kit'
import { inputText } from '@masknet/injected-script'
import { getEditorContent, hasEditor, hasFocus, isCompose } from '../utils/postBox'
import { composeButtonSelector, postEditorDraftContentSelector } from '../utils/selector'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
export const pasteTextToCompositionMinds: SocialNetworkUI.AutomationCapabilities.NativeCompositionDialog['appendText'] =
    (text, opt) => {
        const interval = 500
        const timeout = 5000
        const worker = async function (abort: AbortSignal) {
            const checkSignal = () => {
                if (abort.aborted) throw new Error('Aborted')
            }

            if (!isCompose() && !hasEditor()) {
                // open the composer
                await untilElementAvailable(composeButtonSelector())
                composeButtonSelector().evaluate()!.click()
                checkSignal()
            }

            // get focus
            const i = postEditorDraftContentSelector()
            const textarea = i.evaluate()!
            await untilElementAvailable(i)
            checkSignal()
            while (!hasFocus(i)) {
                textarea?.focus()
                checkSignal()
                await delay(interval)
            }

            selectElementContents(textarea)

            // paste
            inputText(text)

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
