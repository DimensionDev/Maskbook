import { delay } from '@masknet/kit'
import type { SiteAdaptorUI } from '@masknet/types'
import { hasEditor, hasFocus, isCompose } from '../utils/postBox.js'
import { newPostButtonSelector, postEditorDraftContentSelector } from '../utils/selector.js'
import { untilElementAvailable } from '../../../utils/untilElementAvailable.js'
import { pasteImageToCompositionDefault } from '../../../site-adaptor-infra/defaults/automation/AttachImageToComposition.js'

export async function pasteImageToCompositionTwitter(
    url: string | Blob,
    options: SiteAdaptorUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
) {
    const interval = 500

    if (!isCompose() && !hasEditor() && options?.reason !== 'reply') {
        // open tweet window
        await untilElementAvailable(newPostButtonSelector())
        await delay(interval)
        newPostButtonSelector().evaluate()!.click()
    }

    // get focus
    const i = postEditorDraftContentSelector()
    await untilElementAvailable(i)

    while (!hasFocus(i)) {
        i.evaluate()!.click()
        await delay(interval)
    }

    pasteImageToCompositionDefault(() => false)(url, options)
}
