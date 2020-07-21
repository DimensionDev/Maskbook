import {
    dispatchCustomEvents,
    sleep,
    timeout,
    downloadUrl,
    getUrl,
    pasteImageToActiveElements,
} from '../../../utils/utils'
import {
    postEditorDraftContentSelector,
    newPostButtonSelector,
    postsSelector,
    bioCardSelector,
} from '../utils/selector'
import { SocialNetworkUI, SocialNetworkUITasks, getActivatedUI } from '../../../social-network/ui'
import { bioCardParser, postContentParser } from '../utils/fetch'
import { getEditorContent, hasFocus, isCompose, hasEditor } from '../utils/postBox'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'
import Services from '../../../extension/service'
import { twitterEncoding } from '../encoding'
import { createTaskStartSetupGuideDefault } from '../../../social-network/defaults/taskStartSetupGuideDefault'
import { instanceOfTwitterUI } from '.'
import type { ProfileIdentifier } from '../../../database/type'
import { encodeArrayBuffer, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { isMobileTwitter } from '../utils/isMobile'
import { MaskMessage } from '../../../utils/messages'

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
        isMobileTwitter
            ? dispatchCustomEvents(i.evaluate()!, 'input', text)
            : dispatchCustomEvents(i.evaluate()!, 'paste', text)
        await sleep(interval)
        if (!getEditorContent().replace(/\n/g, '').includes(text.replace(/\n/g, ''))) {
            fail(new Error('Unable to paste text automatically'))
        }
    }

    const fail = (e: Error) => {
        if (opt.autoPasteFailedRecover) MaskMessage.events.autoPasteFailed.sendToLocal({ text })
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
    const { template = 'v2', autoPasteFailedRecover, relatedText } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(
        getUrl(
            `${
                template === 'v2' || template === 'v3' || template === 'v4' ? '/image-payload' : '/wallet'
            }/payload-${template}.png`,
        ),
    ).then((x) => x.arrayBuffer())
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
    // TODO: Need a better way to find whether the image is pasted into
    uploadFail()

    async function uploadFail() {
        if (autoPasteFailedRecover) {
            MaskMessage.events.autoPasteFailed.sendToLocal({
                text: relatedText,
                image: new Blob([secretImage], { type: 'image/png' }),
            })
        }
    }
}

const taskOpenComposeBox = async (
    content: string,
    options?: {
        onlyMySelf?: boolean
        shareToEveryOne?: boolean
    },
) => {
    MaskMessage.events.compositionUpdated.sendToLocal({
        reason: 'timeline',
        open: true,
        content,
        options,
    })
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

function taskGotoNewsFeedPage() {
    if (location.pathname.includes('/home')) location.reload()
    else location.pathname = '/home'
}

export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox,
    taskOpenComposeBox,
    taskUploadToPostBox,
    taskUploadShuffleToPostBox,
    taskGetPostContent,
    taskGetProfile,
    taskGotoProfilePage,
    taskGotoNewsFeedPage,
    taskStartSetupGuide: createTaskStartSetupGuideDefault(() => instanceOfTwitterUI),
}
