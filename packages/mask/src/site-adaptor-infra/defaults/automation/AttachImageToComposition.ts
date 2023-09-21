import { waitDocumentReadyState } from '@masknet/kit'
import type { SiteAdaptorUI } from '@masknet/types'
import { MaskMessages } from '@masknet/shared-base'
import { activatedSiteAdaptorUI } from '../../ui.js'
import { downloadUrl, pasteImageToActiveElements } from '../../../utils/index.js'

export function pasteImageToCompositionDefault(hasSucceed: () => Promise<boolean> | boolean) {
    return async function (
        url: string | Blob,
        { recover, relatedTextPayload }: SiteAdaptorUI.AutomationCapabilities.NativeCompositionAttachImageOptions,
    ) {
        const image = typeof url === 'string' ? await downloadUrl(url) : url
        await waitDocumentReadyState('interactive')
        if (relatedTextPayload) {
            const p: Promise<void> | undefined =
                activatedSiteAdaptorUI!.automation.nativeCompositionDialog?.attachText?.(relatedTextPayload, {
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
