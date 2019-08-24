import { dispatchCustomEvents, sleep, untilDocumentReady } from '../../../utils/utils'
import { editProfileButtonSelector, editProfileTextareaSelector, newPostEditorInnerSelector } from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { fetchBioCard, fetchPost, resolveInfoFromBioCard } from './fetch'

export const taskPasteIntoPostBox = async (text: string, warningText: string) => {
    await untilDocumentReady()
    const [i] = newPostEditorInnerSelector.evaluateOnce()
    i.click()
    dispatchCustomEvents('input', text)
    throw new Error("Logic not complete for now, remove this before next release")
    // TODO: detect if things successfully paste in by something like, innerText
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
    throw new Error("Logic not complete for now, remove this before next release")
    // TODO: detect if things successfully paste in, by something like, innerText
}

export const taskGetPostContent = async () => {
    return (await fetchPost()).innerText
}

export const taskGetProfile = async () => {
    await fetchBioCard()
    return { bioContent: resolveInfoFromBioCard().userBio }
}
