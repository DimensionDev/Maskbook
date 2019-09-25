import { dispatchCustomEvents, sleep, timeout, untilDocumentReady } from '../../../utils/utils'
import { editProfileButtonSelector, editProfileTextareaSelector, postParser, postsSelectors } from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { SocialNetworkUI, SocialNetworkUITasks } from '../../../social-network/ui'
import { fetchBioCard } from '../utils/status'
import { resolveInfoFromBioCard } from '../utils/fetch'
import { getFocus, getText } from '../utils/postBox'
import { MutationObserverWatcher } from '@holoflows/kit'

const taskPasteIntoPostBox: SocialNetworkUI['taskPasteIntoPostBox'] = async (text, opt) => {
    await getFocus() // This also waits for document loaded
    dispatchCustomEvents('paste', text)
    if (getText() !== text) {
        console.warn('Text pasting failed')
        prompt(opt.warningText, text)
    }
}

const taskPasteIntoBio = async (text: string) => {
    const getValue = () => editProfileTextareaSelector().evaluate()!.value
    await untilDocumentReady()
    await sleep(800)
    try {
        editProfileButtonSelector()
            .evaluate()!
            .click()
    } catch {
        alert(geti18nString('automation_request_click_edit_bio_button'))
    }
    await sleep(800)
    try {
        const i = editProfileTextareaSelector().evaluate()!
        i.focus()
        await sleep(200)
        dispatchCustomEvents('input', i.value + text)
    } catch {
        console.warn('Text not pasted to the text area')
        prompt(geti18nString('automation_request_paste_into_bio_box'), text)
    }
    if (getValue().indexOf(text) === -1) {
        console.warn('Text pasting failed')
        prompt(geti18nString('automation_request_paste_into_bio_box'), text)
    }
}

const taskGetPostContent: SocialNetworkUITasks['taskGetPostContent'] = async () => {
    return postParser((await timeout(new MutationObserverWatcher(postsSelectors()), 10000))[0]).content
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
