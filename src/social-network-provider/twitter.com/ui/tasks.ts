import { dispatchCustomEvents, sleep, timeout } from '../../../utils/utils'
import {
    editProfileButtonSelector,
    editProfileTextareaSelector,
    hasDraftEditor,
    newPostButton,
    newPostEditorFocusAnchor,
    postsSelector,
} from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { SocialNetworkUI, SocialNetworkUITasks } from '../../../social-network/ui'
import { fetchBioCard } from '../utils/status'
import { bioCardParser, postParser } from '../utils/fetch'
import { getText, hasFocus, postBoxInPopup } from '../utils/postBox'
import { MutationObserverWatcher } from '@holoflows/kit'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
const taskPasteIntoPostBox: SocialNetworkUI['taskPasteIntoPostBox'] = (text, opt) => {
    const interval = 500
    const timeout = 5000
    const worker = async function(abort: AbortController) {
        const checkSignal = () => {
            if (abort.signal.aborted) throw new Error('Aborted')
        }
        if (!postBoxInPopup() && !hasDraftEditor()) {
            // open tweet window
            await untilElementAvailable(newPostButton())
            newPostButton()
                .evaluate()!
                .click()
            checkSignal()
        }

        // get focus
        const i = newPostEditorFocusAnchor()
        await untilElementAvailable(i)
        checkSignal()
        while (!hasFocus(i)) {
            i.evaluate()!.focus()
            checkSignal()
            await sleep(interval)
        }
        // paste
        dispatchCustomEvents('paste', text)
        if (!getText().includes(text)) {
            prompt(opt.warningText, text)
            throw new Error('Unable to paste text automatically')
        }
    }

    const fail = (e: Error) => {
        prompt(opt.warningText, text)
        throw e
    }

    const abortCtr = new AbortController()
    setTimeout(() => {
        abortCtr.abort()
    }, timeout)
    worker(abortCtr).then(undefined, e => fail(e))
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
    return (await postParser((await timeout(new MutationObserverWatcher(postsSelector()), 10000))[0])).content
}

const taskGetProfile = async () => {
    await fetchBioCard()
    return { bioContent: bioCardParser().bio }
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
}
