import { makeTypedMessageText, SerializableTypedMessages } from '@masknet/typed-message'
import { CrossIsolationMessages, CompositionDialogEvent } from '@masknet/shared-base'
import { delay, waitDocumentReadyState } from '@dimensiondev/kit'
import { i18n } from '../../../../shared-ui/locales_legacy/index.js'
import { composeButtonSelector, composeDialogIndicatorSelector, composeTextareaSelector } from '../utils/selector.js'

export async function openComposeBoxMinds(
    content: string | SerializableTypedMessages,
    options?: CompositionDialogEvent['options'],
) {
    await waitDocumentReadyState('interactive')
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
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'popup',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
