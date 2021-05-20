import type { SocialNetworkUI } from '../../../social-network'
import { MaskMessage } from '../../../utils/messages'
import { downloadUrl } from '../../../utils/utils'
import { composerModalTextAreaSelector, composerPreviewSelector } from '../utils/selector'

const hasSucceed = () => composerPreviewSelector().evaluate()

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

        if (hasSucceed()) {
            // clear clipboard
            return navigator.clipboard.writeText('')
        } else if (recover) {
            MaskMessage.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
