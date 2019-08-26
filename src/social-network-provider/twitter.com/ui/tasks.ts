import { dispatchCustomEvents, sleep, untilDocumentReady } from '../../../utils/utils'
import { editProfileButtonSelector, editProfileTextareaSelector, newPostEditorInnerSelector } from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { notNullable } from '../../../utils/assert'
import { SocialNetworkUITasks } from '../../../social-network/ui'
import { fetchBioCard, fetchPost } from '../utils/status'
import { resolveInfoFromBioCard } from '../utils/fetch'

const taskPasteIntoPostBox = async (text: string) => {
    await untilDocumentReady()
    const i = newPostEditorInnerSelector().evaluate()
    notNullable(i).click()
    dispatchCustomEvents('input', text)
    throw new Error('Logic not complete for now, remove this before next release')
    // TODO: detect if things successfully paste in by something like, innerText
}

const taskPasteIntoBio = async (text: string) => {
    // TODO: try to remove timeout
    await untilDocumentReady()
    try {
        const b = editProfileButtonSelector().evaluate()
        await sleep(200)
        notNullable(b).click()
    } catch {
        prompt(geti18nString('automation_request_click_edit_bio_button'))
    }
    await sleep(400)
    try {
        const i = notNullable(editProfileTextareaSelector().evaluate())
        await sleep(200)
        i.focus()
        dispatchCustomEvents('input', i.value + text)
    } catch {
        console.warn('Text not pasted to the text area')
        prompt(geti18nString('automation_request_paste_into_bio_box'), text)
    }
    throw new Error('Logic not complete for now, remove this before next release')
    // TODO: detect if things successfully paste in, by something like, innerText
}

const taskGetPostContent = async () => {
    return (await fetchPost()).innerText
}

const taskGetProfile = async () => {
    await fetchBioCard()
    return { bioContent: resolveInfoFromBioCard().userBio }
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
}
