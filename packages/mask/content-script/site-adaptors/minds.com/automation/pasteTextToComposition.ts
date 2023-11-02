import type { SiteAdaptorUI } from '@masknet/types'
import { untilElementAvailable } from '../../../utils/untilElementAvailable.js'
import { selectElementContents } from '../../../utils/selectElementContents.js'
import { delay } from '@masknet/kit'
import { inputText } from '@masknet/injected-script'
import { getEditorContent, hasEditor, hasFocus, isCompose } from '../utils/postBox.js'
import { composeButtonSelector, postEditorDraftContentSelector } from '../utils/selector.js'
import { MaskMessages } from '@masknet/shared-base'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
export const pasteTextToCompositionMinds: SiteAdaptorUI.AutomationCapabilities.NativeCompositionDialog['attachText'] = (
    text,
    opt,
) => {
    const interval = 500
    const timeout = 5000
    const worker = async function (abort: AbortSignal) {
        const checkSignal = () => {
            if (abort.aborted) throw new Error('Abort to paste text to the composition dialog at minds.')
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

        // Simulate textarea input
        SimulateTextareaInput(textarea.id)

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

function SimulateTextareaInput(id: string) {
    document.getElementById(id)?.dispatchEvent(new Event('input', { bubbles: true }))
}
