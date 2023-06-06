import { delay } from '@masknet/kit'
import type { SocialNetworkUI } from '@masknet/types'
import { hasEditor, hasFocus, isCompose } from '../utils/postBox.js'
import { newPostButtonSelector, postEditorDraftContentSelector } from '../utils/selector.js'
import { untilElementAvailable } from '../../../utils/dom.js'
import { pasteImageToCompositionDefault } from '../../../social-network/defaults/automation/AttachImageToComposition.js'

export async function pasteImageToCompositionTwitter(
    url: string | Blob,
    options: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
) {
    const interval = 500

    if (!isCompose() && !hasEditor() && options.reason !== 'reply') {
        // open tweet window
        await untilElementAvailable(newPostButtonSelector())
        newPostButtonSelector().evaluate()!.click()
    }

    // get focus
    const i = postEditorDraftContentSelector()
    await untilElementAvailable(i)

    while (!hasFocus(i)) {
        i.evaluate()!.focus()
        await delay(interval)
    }
    pasteImageToCompositionDefault(() => false)(url, options)
}
