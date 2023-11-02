import { delay } from '@masknet/kit'
import { pasteText } from '@masknet/injected-script'
import type { SiteAdaptorUI } from '@masknet/types'
import { MaskMessages } from '@masknet/shared-base'
import { newPostButtonSelector, postEditorDraftContentSelector } from '../utils/selector.js'
import { getEditorContent, hasEditor, hasFocus, isCompose } from '../utils/postBox.js'
import { untilElementAvailable } from '../../../utils/untilElementAvailable.js'
import { selectElementContents } from '../../../utils/selectElementContents.js'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
export const pasteTextToCompositionTwitter: SiteAdaptorUI.AutomationCapabilities.NativeCompositionDialog['attachText'] =
    (text, opt) => {
        const interval = 500
        const timeout = 5000
        const worker = async function (abort: AbortSignal) {
            const checkSignal = () => {
                if (abort.aborted) throw new Error('Abort to paste text to the composition dialog at twitter.')
            }

            if (
                (!isCompose() && opt?.reason === 'verify') ||
                (!isCompose() && !hasEditor() && opt?.reason !== 'reply')
            ) {
                // open tweet window
                await untilElementAvailable(newPostButtonSelector())
                await delay(interval)
                newPostButtonSelector().evaluate()!.click()
                checkSignal()
            }

            // get focus
            const i = postEditorDraftContentSelector()
            await untilElementAvailable(i)
            await delay(interval)
            checkSignal()

            if (opt?.reason === 'verify') {
                selectElementContents(i.evaluate()!)
            }

            while (!hasFocus(i)) {
                i.evaluate()!.click()
                checkSignal()
                await delay(interval)
            }

            // paste
            pasteText(text)
            await delay(interval)

            if (!getEditorContent().replaceAll('\n', '').includes(text.replaceAll('\n', ''))) {
                fail(new Error('Unable to paste text automatically'))
            }
        }

        const fail = (e: Error) => {
            if (opt?.recover) MaskMessages.events.autoPasteFailed.sendToLocal({ text })
            throw e
        }

        return worker(AbortSignal.timeout(timeout)).then(undefined, (error) => fail(error))
    }
