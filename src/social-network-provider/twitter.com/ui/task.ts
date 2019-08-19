import { dispatchCustomEvents, sleep, untilDocumentReady } from '../../../utils/utils'
import { editProfileButtonSelector, editProfileTextareaSelector, newPostEditorInnerSelector } from '../utils/selectors'
import { geti18nString } from '../../../utils/i18n'

export const taskPasteIntoPostBox = async (text: string, warningText: string) => {
    // placeholder, not working now.
    await untilDocumentReady()
    const [i] = newPostEditorInnerSelector.evaluateOnce()
    i.click()
    dispatchCustomEvents('input', text)
}

export const taskPasteIntoBio = async (text: string) => {
    // TODO: try to remove timeout
    await untilDocumentReady()
    try {
        const [b] = editProfileButtonSelector.evaluateOnce()
        await sleep(200)
        b.click()
    } catch {
        prompt(geti18nString('automation_request_click_edit_bio_button'))
    }
    await sleep(400)
    try {
        const [i] = editProfileTextareaSelector.evaluateOnce()
        await sleep(200)
        i.focus()
        dispatchCustomEvents('input', i.value + text)
    } catch {
        console.warn('Text not pasted to the text area')
        prompt(geti18nString('automation_request_paste_into_bio_box'), text)
    }
}

export const taskGetPostContent = () => {

}
