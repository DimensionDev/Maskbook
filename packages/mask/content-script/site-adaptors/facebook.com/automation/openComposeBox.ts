import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { CrossIsolationMessages, type CompositionDialogEvent } from '@masknet/shared-base'
import { makeTypedMessageText, type SerializableTypedMessages } from '@masknet/typed-message'
import { delay, waitDocumentReadyState } from '@masknet/kit'

function nativeComposeButtonSelector() {
    return new LiveSelector()
        .querySelector<HTMLDivElement>(
            [
                '[role="region"] [role="link"]+[role="button"]',
                '#MComposer [role="button"]', // mobile
            ].join(','),
        )
        .enableSingleMode()
}

function nativeComposeTextareaSelector() {
    return new LiveSelector()
        .querySelector<HTMLTextAreaElement>(
            [
                '#structured_composer_form .mentions textarea', // mobile
            ].join(','),
        )
        .enableSingleMode()
}

function nativeComposeDialogIndicatorSelector() {
    return new LiveSelector().querySelector<HTMLDivElement>(
        [
            // PC -  the form of compose dialog
            '[role="dialog"] form[method="post"]',

            // mobile - the submit button
            '#composer-main-view-id button[type="submit"]',
        ].join(','),
    )
}

function nativeComposeDialogCloseButtonSelector() {
    return new LiveSelector().querySelector<HTMLDivElement>('[role="dialog"] form[method="post"] [role="button"]')
}

export async function taskOpenComposeBoxFacebook(
    content: string | SerializableTypedMessages,
    failedMessage: string,
    options?: CompositionDialogEvent['options'],
) {
    await waitDocumentReadyState('interactive')
    await delay(200)

    // active the compose dialog
    const composeTextarea = nativeComposeTextareaSelector().evaluate()
    const composeButton = nativeComposeButtonSelector().evaluate()
    if (composeTextarea) composeTextarea.focus()
    if (composeButton) composeButton.click()
    await delay(200)

    // the indicator only available when compose dialog opened successfully
    const composeIndicator = nativeComposeDialogIndicatorSelector().evaluate()
    if (!composeIndicator) {
        // eslint-disable-next-line no-alert
        alert(failedMessage)
        return
    }

    await delay(2000)
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'popup',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}

export async function taskCloseNativeComposeBoxFacebook() {
    await waitDocumentReadyState('interactive')
    await delay(200)
    const closeDialogButton = nativeComposeDialogCloseButtonSelector().evaluate()?.[0]
    closeDialogButton?.click()
}
