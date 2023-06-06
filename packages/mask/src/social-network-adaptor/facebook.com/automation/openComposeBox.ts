import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { CrossIsolationMessages, type CompositionDialogEvent } from '@masknet/shared-base'
import { i18n } from '../../../../shared-ui/locales_legacy/index.js'
import { makeTypedMessageText, type SerializableTypedMessages } from '@masknet/typed-message'
import { delay, waitDocumentReadyState } from '@masknet/kit'

const nativeComposeButtonSelector = () =>
    new LiveSelector()
        .querySelector<HTMLDivElement>(
            [
                '[role="region"] [role="link"]+[role="button"]',
                '#MComposer [role="button"]', // mobile
            ].join(','),
        )
        .enableSingleMode()

const nativeComposeTextareaSelector = () =>
    new LiveSelector()
        .querySelector<HTMLTextAreaElement>(
            [
                '#structured_composer_form .mentions textarea', // mobile
            ].join(','),
        )
        .enableSingleMode()

const nativeComposeDialogIndicatorSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>(
        [
            // PC -  the form of compose dialog
            '[role="dialog"] form[method="post"]',

            // mobile - the submit button
            '#composer-main-view-id button[type="submit"]',
        ].join(','),
    )

const nativeComposeDialogCloseButtonSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>('[role="dialog"] form[method="post"] [role="button"]')

export async function taskOpenComposeBoxFacebook(
    content: string | SerializableTypedMessages,
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
        alert(i18n.t('automation_request_click_post_button'))
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
    const closeDialogButton = nativeComposeDialogCloseButtonSelector().evaluate()[0]
    closeDialogButton.click()
}
