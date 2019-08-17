import { dispatchCustomEvents, untilDocumentReady } from '../../../utils/utils'
import { newPostEditorInnerSelector } from '../utils/selectors'

export const taskPasteIntoPostBox = async (text: string, warningText: string) => {
    // placeholder, not working now.
    await untilDocumentReady()
    const i = newPostEditorInnerSelector.evaluateOnce()[0]
    i.click()
    dispatchCustomEvents('input', text)
}
