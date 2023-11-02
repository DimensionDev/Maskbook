import type { SiteAdaptorUI } from '@masknet/types'
import { downloadUrl } from '../../../utils/downloadUrl.js'
import { composerModalTextAreaSelector, composerPreviewSelector } from '../utils/selector.js'
import { pasteTextToCompositionMinds } from './pasteTextToComposition.js'
import { MaskMessages } from '@masknet/shared-base'

function hasSucceed() {
    return composerPreviewSelector().evaluate()
}

export function pasteImageToCompositionMinds() {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SiteAdaptorUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        const data = [new ClipboardItem({ [image.type]: image })]

        pasteTextToCompositionMinds!(relatedTextPayload || '', { recover: false })

        await navigator.clipboard.write(data)
        composerModalTextAreaSelector().evaluate()?.focus()
        document.execCommand('paste')

        if (hasSucceed()) {
            // clear clipboard
            return navigator.clipboard.writeText('')
        } else if (recover) {
            MaskMessages.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
