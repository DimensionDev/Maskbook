import {
    dispatchCustomEvents,
    sleep,
    timeout,
    downloadUrl,
    getUrl,
    pasteImageToActiveElements,
} from '../../../utils/utils'
import {
    profileEditorButtonSelector,
    profileEditorTextareaSelector,
    postEditorDraftContentSelector,
    newPostButtonSelector,
    postsSelector,
    bioCardSelector,
} from '../utils/selector'
import { geti18nString } from '../../../utils/i18n'
import { SocialNetworkUI, SocialNetworkUITasks, getActivatedUI } from '../../../social-network/ui'
import { bioCardParser, postContentParser } from '../utils/fetch'
import { getEditorContent, hasFocus, isCompose, hasEditor } from '../utils/postBox'
import { MutationObserverWatcher } from '@holoflows/kit'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'
import Services from '../../../extension/service'
import { twitterEncoding } from '../encoding'
import { createTaskStartImmersiveSetupDefault } from '../../../social-network/defaults/taskStartImmersiveSetupDefault'

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
        if (!isCompose() && !hasEditor()) {
            // open tweet window
            await untilElementAvailable(newPostButtonSelector())
            newPostButtonSelector()
                .evaluate()!
                .click()
            checkSignal()
        }

        // get focus
        const i = postEditorDraftContentSelector()
        await untilElementAvailable(i)
        checkSignal()
        while (!hasFocus(i)) {
            i.evaluate()!.focus()
            checkSignal()
            await sleep(interval)
        }
        // paste
        dispatchCustomEvents('paste', text)
        await sleep(interval)
        if (!getEditorContent().includes(text)) {
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

const taskUploadToPostBox: SocialNetworkUI['taskUploadToPostBox'] = async (text, options) => {
    const { warningText } = options
    const { currentIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(getUrl('/maskbook-steganography.png'))
    const secretImage = await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
        text,
        pass: currentIdentity.value ? currentIdentity.value.identifier.toText() : '',
    })

    const image = new Uint8Array(secretImage)

    await pasteImageToActiveElements(image)
    await untilDocumentReady()

    try {
        // Need a better way to find whether the image is pasted into
        // throw new Error('auto uploading is undefined')
    } catch {
        uploadFail()
    }

    async function uploadFail() {
        console.warn('Image not uploaded to the post box')
        if (confirm(warningText)) {
            await Services.Steganography.downloadImage(image)
        }
    }
}

const taskPasteIntoBio = async (text: string) => {
    const getValue = () => profileEditorTextareaSelector().evaluate()!.value
    await untilDocumentReady()
    await sleep(800)
    try {
        profileEditorButtonSelector()
            .evaluate()!
            .click()
    } catch {
        alert(geti18nString('automation_request_click_edit_bio_button'))
    }
    await sleep(800)
    try {
        const i = profileEditorTextareaSelector().evaluate()!
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
    } else {
        setTimeout(() => alert(geti18nString('automation_pasted_into_bio_box')))
    }
}

const taskGetPostContent: SocialNetworkUITasks['taskGetPostContent'] = async () => {
    const contentNode = (await timeout(new MutationObserverWatcher(postsSelector()), 10000))[0]
    return contentNode ? postContentParser(contentNode) : ''
}

const taskGetProfile = async () => {
    const { publicKeyEncoder, publicKeyDecoder } = twitterEncoding
    const cardNode = (await timeout(new MutationObserverWatcher(bioCardSelector<false>(false)), 10000))[0]
    const bio = cardNode ? bioCardParser(cardNode).bio : ''
    return {
        bioContent: publicKeyEncoder(publicKeyDecoder(bio)[0] || ''),
    }
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskUploadToPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
    taskStartImmersiveSetup: createTaskStartImmersiveSetupDefault(),
}
