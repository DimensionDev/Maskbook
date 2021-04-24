import type { SocialNetworkUI } from '../../../social-network'
import { untilDocumentReady } from '../../../utils/dom'
import { MaskMessage } from '../../../utils/messages'
import { dispatchCustomEvents, downloadUrl } from '../../../utils/utils'
import { mindsTextareaSelector } from '../utils/selector'

export function pasteImageToCompositionMinds(hasSucceed: () => Promise<boolean> | boolean) {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        await untilDocumentReady()

        const bytes = new Uint8Array(await image.arrayBuffer())
        dispatchCustomEvents(mindsTextareaSelector().evaluate(), 'paste', { type: 'image', value: Array.from(bytes) })

        if (await hasSucceed()) return
        if (recover) {
            MaskMessage.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
