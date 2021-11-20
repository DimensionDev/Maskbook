import { delay, downloadUrl, MaskMessages, pasteImageToActiveElements, untilDocumentReady } from '../../../utils'
import type { SocialNetworkUI } from '../../types'
import { activatedSocialNetworkUI } from '../../ui'

export function pasteImageToCompositionDefault(hasSucceed: () => Promise<boolean> | boolean) {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        await untilDocumentReady()
        if (relatedTextPayload) {
            activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(relatedTextPayload, {
                recover: false,
            })
            await delay(500)
        }
        await pasteImageToActiveElements(image)

        if (await hasSucceed()) return
        if (recover) {
            MaskMessages.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
