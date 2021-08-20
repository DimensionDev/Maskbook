import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { MaskMessage, CompositionRequest } from '../../../utils/messages'
import { i18n } from '../../../utils/i18n-next'
import { delay } from '../../../utils/utils'
import { untilDocumentReady } from '../../../utils/dom'
import { makeTypedMessageText, TypedMessage } from '../../../protocols/typed-message'

const nativeComposeButtonSelector = () =>
    new LiveSelector()
        .querySelector<HTMLDivElement>(
            [
                '[role="region"] [role="link"]+[role="button"]', // PC
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

export async function taskOpenComposeBoxFacebook(
    content: string | TypedMessage,
    options?: CompositionRequest['options'],
) {
    await untilDocumentReady()
    await delay(800)

    // active the compose dialog
    const composeTextarea = nativeComposeTextareaSelector().evaluate()
    const composeButton = nativeComposeButtonSelector().evaluate()
    if (composeTextarea) composeTextarea.focus()
    if (composeButton) composeButton.click()
    await delay(800)

    // the indicator only available when compose dialog opened successfully
    const composeIndicator = nativeComposeDialogIndicatorSelector().evaluate()
    if (!composeIndicator) {
        alert(i18n.t('automation_request_click_post_button'))
        return
    }

    await delay(800)
    MaskMessage.events.requestComposition.sendToLocal({
        reason: 'popup',
        open: true,
        content: typeof content === 'string' ? makeTypedMessageText(content) : content,
        options,
    })
}
