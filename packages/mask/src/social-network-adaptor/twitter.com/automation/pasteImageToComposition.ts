import { delay } from '@dimensiondev/kit'
import type { SocialNetworkUI } from '../../../social-network/index.js'
import { hasFocus } from '../utils/postBox.js'
import { postEditorDraftContentSelector } from '../utils/selector.js'
import { untilElementAvailable } from '../../../utils/dom.js'
import { pasteImageToCompositionDefault } from '../../../social-network/defaults/automation/AttachImageToComposition.js'

export function pasteImageToCompositionTwitter(hasSucceed: () => Promise<boolean> | boolean) {
    const pasteImage = pasteImageToCompositionDefault(hasSucceed)
    return async function (
        url: string | Blob,
        options: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const interval = 500
        // get focus
        const i = postEditorDraftContentSelector()
        await untilElementAvailable(i)

        while (!hasFocus(i)) {
            i.evaluate()!.focus()
            await delay(interval)
        }
        pasteImage(url, options)
    }
}
