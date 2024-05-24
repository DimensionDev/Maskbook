import { makeTypedMessageText, type SerializableTypedMessages } from '@masknet/typed-message'
import { CrossIsolationMessages, type CompositionDialogEvent } from '@masknet/shared-base'
import { delay, waitDocumentReadyState } from '@masknet/kit'
import { composeButtonSelector, composeDialogIndicatorSelector, composeTextareaSelector } from '../utils/selector.js'

export async function openComposeBoxMinds(
    content: string | SerializableTypedMessages,
    failedMessage: string,
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
        // eslint-disable-next-line no-alert
        alert(failedMessage)
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
