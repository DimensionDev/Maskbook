import { selectElementContents } from '../../../utils/selectElementContents.js'
import { delay } from '@masknet/kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { pasteText } from '@masknet/injected-script'
import { MaskMessages } from '@masknet/shared-base'

export async function pasteToCommentBoxFacebook(encryptedComment: string, current: PostInfo, dom: HTMLElement | null) {
    const fail = () => {
        MaskMessages.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
    }
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
