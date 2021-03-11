import { untilDocumentReady } from '../../../utils/dom'
import { downloadUrl, pasteImageToActiveElements } from '../../../utils/utils'
import { MaskMessage } from '../../../utils/messages'
import type { SocialNetworkUI } from '../../../social-network-next'

export async function pasteImageToCompositionFacebook(
    url: string | Blob | File,
    { recover, relatedTextPayload }: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
) {
    const image = typeof url === 'string' ? await downloadUrl(url) : url
    await untilDocumentReady()
    pasteImageToActiveElements(new Uint8Array(await image.arrayBuffer()))

    // TODO: Need a better way to find whether the image is pasted into
    if (recover) {
        MaskMessage.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
    }
}
