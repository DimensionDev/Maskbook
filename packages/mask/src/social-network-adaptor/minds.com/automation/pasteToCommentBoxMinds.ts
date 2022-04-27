import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { MaskMessages } from '../../../utils/messages'
import { delay } from '@dimensiondev/kit'
import { selectElementContents } from '../../../utils/utils'
import { pasteText } from '@masknet/injected-script'

export async function pasteToCommentBoxMinds(encryptedComment: string, current: PostInfo, dom: HTMLElement | null) {
    const fail = () => {
        MaskMessages.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
    }
    const root = dom || current.rootNode
    if (!root) return fail()
    const input = root.querySelector('[contenteditable]')
    if (!input) return fail()
    selectElementContents(input)
    pasteText(encryptedComment)
    await delay(200)
    if (!root.innerText.includes(encryptedComment)) return fail()
}
