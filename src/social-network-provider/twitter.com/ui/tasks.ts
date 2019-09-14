import { dispatchCustomEvents, sleep, untilDocumentReady } from '../../../utils/utils'
import { editProfileButtonSelector, editProfileTextareaSelector } from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { SocialNetworkUI, SocialNetworkUITasks } from '../../../social-network/ui'
import { fetchBioCard, fetchPost } from '../utils/status'
import { resolveInfoFromBioCard } from '../utils/fetch'
import { getFocus, getText } from '../utils/postBox'

const taskPasteIntoPostBox: SocialNetworkUI['taskPasteIntoPostBox'] = async (text, opt) => {
    await getFocus() // This also waits for document loaded
    dispatchCustomEvents('paste', text)
    if (getText() !== text) {
        console.warn('Text pasting failed')
        prompt(opt.warningText, text)
    }
}

const taskPasteIntoBio = async (text: string) => {
    await untilDocumentReady()
    try {
        const b = editProfileButtonSelector().evaluate()
        await sleep(200)
        b!.click()
    } catch {
        prompt(geti18nString('automation_request_click_edit_bio_button'))
    }
    await sleep(400)
    try {
        const i = editProfileTextareaSelector().evaluate()!
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
    return { bioContent: resolveInfoFromBioCard().bio }
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
}
