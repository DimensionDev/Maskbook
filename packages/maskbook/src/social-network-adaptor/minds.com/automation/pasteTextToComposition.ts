import type { SocialNetworkUI } from '../../../social-network'
import { untilElementAvailable } from '../../../utils/dom'
import { MaskMessage } from '../../../utils/messages'
import { delay, selectElementContents } from '../../../utils/utils'
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
        const worker = async function (abort: AbortController) {
            const checkSignal = () => {
                if (abort.signal.aborted) throw new Error('Aborted')
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
            if (opt?.recover) MaskMessage.events.autoPasteFailed.sendToLocal({ text })
            throw e
        }

        const abortCtr = new AbortController()
        setTimeout(() => {
            abortCtr.abort()
        }, timeout)
        worker(abortCtr).then(undefined, (error) => fail(error))
    }
