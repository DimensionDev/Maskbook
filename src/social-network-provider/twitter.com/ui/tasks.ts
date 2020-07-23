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
import { i18n } from '../../../utils/i18n-next'
import { SocialNetworkUI, SocialNetworkUITasks, getActivatedUI } from '../../../social-network/ui'
import { bioCardParser, postContentParser } from '../utils/fetch'
import { getEditorContent, hasFocus, isCompose, hasEditor } from '../utils/postBox'
import { MutationObserverWatcher } from '@holoflows/kit'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'
import Services from '../../../extension/service'
import { twitterEncoding } from '../encoding'
import { createTaskStartImmersiveSetupDefault } from '../../../social-network/defaults/taskStartImmersiveSetupDefault'
import { instanceOfTwitterUI } from '.'
import type { ProfileIdentifier } from '../../../database/type'
import { encodeArrayBuffer, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { isMobileTwitter } from '../utils/isMobile'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
const taskPasteIntoPostBox: SocialNetworkUI['taskPasteIntoPostBox'] = (text, opt) => {
    const interval = 500
    const timeout = 5000
    const worker = async function (abort: AbortController) {
        const checkSignal = () => {
            if (abort.signal.aborted) throw new Error('Aborted')
        }
        if (!isCompose() && !hasEditor()) {
            // open tweet window
            await untilElementAvailable(newPostButtonSelector())
            newPostButtonSelector().evaluate()!.click()
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
        isMobileTwitter ? dispatchCustomEvents('input', text) : dispatchCustomEvents('paste', text)
        await sleep(interval)
        if (!getEditorContent().replace(/\n/g, '').includes(text.replace(/\n/g, ''))) {
            prompt(opt.warningText, text)
            throw new Error('Unable to paste text automatically')
        }
    }

    const fail = (e: Error) => {
        if (opt.warningText) prompt(opt.warningText, text)
        throw e
    }

    const abortCtr = new AbortController()
    setTimeout(() => {
        abortCtr.abort()
    }, timeout)
    worker(abortCtr).then(undefined, (e) => fail(e))
}

const taskUploadShuffleToPostBox = async (shuffledImage: Uint8Array) => {
    pasteImageToActiveElements(shuffledImage)
    await untilDocumentReady()
}

const taskUploadToPostBox: SocialNetworkUI['taskUploadToPostBox'] = async (text, options) => {
    const { warningText, template = 'v2' } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(
        getUrl(`${template === 'v2' ? '/image-payload' : '/wallet'}/payload-${template}.png`),
    )
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(encodeArrayBuffer(blankImage), {
                text,
                pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
                template,
            }),
        ),
    )
    pasteImageToActiveElements(secretImage)
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
            await Services.Steganography.downloadImage(secretImage)
        }
    }
}

const taskPasteIntoBio = async (text: string) => {
    const getValue = () => profileEditorTextareaSelector().evaluate()!.value
    await untilDocumentReady()
    await sleep(800)
    try {
        profileEditorButtonSelector().evaluate()!.click()
    } catch {
        alert(i18n.t('automation_request_click_edit_bio_button'))
    }
    await sleep(800)
    try {
        const i = profileEditorTextareaSelector().evaluate()!
        i.focus()
        await sleep(200)
        dispatchCustomEvents('input', i.value + text)
    } catch {
        console.warn('Text not pasted to the text area')
        prompt(i18n.t('automation_request_paste_into_bio_box'), text)
    }
    if (getValue().indexOf(text) === -1) {
        console.warn('Text pasting failed')
        prompt(i18n.t('automation_request_paste_into_bio_box'), text)
    } else {
        setTimeout(() => alert(i18n.t('automation_pasted_into_bio_box')))
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

function taskGotoProfilePage(profile: ProfileIdentifier) {
    const path = `/${profile.userId}`
    // The PWA way
    ;(document.querySelector(`[href="${path}"]`) as HTMLElement | undefined)?.click()
    setTimeout(() => {
        // The classic way
        if (!location.pathname.startsWith(path)) location.pathname = path
    }, 400)
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskUploadToPostBox,
    taskUploadShuffleToPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
    taskStartImmersiveSetup: createTaskStartImmersiveSetupDefault(() => instanceOfTwitterUI),
    taskGotoProfilePage: taskGotoProfilePage,
}
