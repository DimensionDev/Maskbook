import { selectElementContents, delay } from '../../../utils/utils'
import { isMobileFacebook } from '../utils/isMobile'
import { MaskMessages } from '../../../utils/messages'
import type { PostInfo } from '../../../social-network/PostInfo'
import { inputText, pasteText } from '@masknet/injected-script'

export async function pasteToCommentBoxFacebook(encryptedComment: string, current: PostInfo, dom: HTMLElement | null) {
    const fail = () => {
        MaskMessages.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
    }
    if (isMobileFacebook) {
        const root = dom || current.comment?.commentBoxSelector?.evaluate()[0]
        if (!root) return fail()
        const textarea = root.querySelector('textarea')
        if (!textarea) return fail()
        textarea.focus()
        inputText(encryptedComment)
        textarea.dispatchEvent(new CustomEvent('input', { bubbles: true, cancelable: false, composed: true }))
        await delay(200)
        if (!root.innerText.includes(encryptedComment)) return fail()
    } else {
        const root = dom || current.rootNode
        if (!root) return fail()
        const input = root.querySelector<HTMLElement>('[contenteditable] > *')
        if (!input) return fail()
        selectElementContents(input)
        input.focus()
        pasteText(encryptedComment)
        await delay(200)
        if (!root.innerText.includes(encryptedComment)) return fail()
    }
}
