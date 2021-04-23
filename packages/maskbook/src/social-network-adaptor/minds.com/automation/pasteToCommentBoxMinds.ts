import type { PostInfo } from '../../../social-network/PostInfo'
import { MaskMessage } from '../../../utils/messages'
import { delay, dispatchCustomEvents, selectElementContents } from '../../../utils/utils'

export async function pasteToCommentBoxMinds(encryptedComment: string, current: PostInfo, dom: HTMLElement | null) {
    const fail = () => {
        MaskMessage.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
    }
    const root = dom || current.rootNode
    if (!root) return fail()
    const input = root.querySelector('[contenteditable]')
    if (!input) return fail()
    selectElementContents(input)
    dispatchCustomEvents(input, 'paste', encryptedComment)
    await delay(200)
    if (!root.innerText.includes(encryptedComment)) return fail()
}
