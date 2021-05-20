import type { SocialNetworkUI } from '../../../social-network'
import { MaskMessage } from '../../../utils/messages'
import { downloadUrl } from '../../../utils/utils'
import { getEditorContent } from '../utils/postBox'
import { composerModalTextAreaSelector, composerPreviewSelector } from '../utils/selector'

const hasSucceed = async (text: string) => {
    const composerImagePreview = composerPreviewSelector().evaluate()
    const composerTextPayloadPasted = getEditorContent().replace(/\n/g, '').includes(text.replace(/\n/g, ''))

    return composerImagePreview && composerTextPayloadPasted
}

export function pasteImageToCompositionMinds() {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        let data = [new ClipboardItem({ [image.type]: image })]
        await navigator.clipboard.write(data)
        composerModalTextAreaSelector().evaluate()?.focus()
        document.execCommand('paste')

        if (relatedTextPayload && (await hasSucceed(relatedTextPayload))) {
            // clear clipboard
            return navigator.clipboard.writeText('')
        } else if (recover) {
            MaskMessage.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
