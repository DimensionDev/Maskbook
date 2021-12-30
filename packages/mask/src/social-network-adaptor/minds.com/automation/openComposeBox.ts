import { makeTypedMessageText, TypedMessage, delay } from '@masknet/shared-base'
import { untilDocumentReady } from '../../../utils/dom'
import { i18n } from '../../../../shared-ui/locales_legacy'
import { MaskMessages, CompositionRequest } from '../../../utils/messages'
import { composeButtonSelector, composeDialogIndicatorSelector, composeTextareaSelector } from '../utils/selector'

export async function openComposeBoxMinds(content: string | TypedMessage, options?: CompositionRequest['options']) {
    await untilDocumentReady()
    await delay(800)

    // active the compose dialog
    const composeTextarea = composeTextareaSelector().evaluate()
    const composeButton = composeButtonSelector().evaluate()
    if (composeButton) composeButton.click()
    if (composeTextarea) composeTextarea.focus()
    await delay(800)

    // the indicator only available when compose dialog opened successfully
    const composeIndicator = composeDialogIndicatorSelector().evaluate()
    if (!composeIndicator) {
        alert(i18n.t('automation_request_click_post_button'))
        return
    }

    await delay(800)
    MaskMessages.events.requestComposition.sendToLocal({
        reason: 'popup',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
