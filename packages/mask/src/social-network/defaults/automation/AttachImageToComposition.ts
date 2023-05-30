import { downloadUrl, MaskMessages, pasteImageToActiveElements } from '../../../utils/index.js'
import { waitDocumentReadyState } from '@masknet/kit'
import type { SocialNetworkUI } from '@masknet/types'
import { activatedSocialNetworkUI } from '../../ui.js'

export function pasteImageToCompositionDefault(hasSucceed: () => Promise<boolean> | boolean) {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SocialNetworkUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        await waitDocumentReadyState('interactive')
        if (relatedTextPayload) {
            const p: Promise<void> | undefined =
                activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(relatedTextPayload, {
                    recover: false,
                })
            await p
        }
        await pasteImageToActiveElements(image)

        if (await hasSucceed()) return
        if (recover) {
            MaskMessages.events.autoPasteFailed.sendToLocal({ text: relatedTextPayload || '', image })
        }
    }
}
