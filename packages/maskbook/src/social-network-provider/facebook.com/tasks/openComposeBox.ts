import { LiveSelector } from '@dimensiondev/holoflows-kit/es'
import { MessageCenter } from '../../../utils/messages'
import { i18n } from '../../../utils/i18n-next'
import { sleep } from '../../../utils/utils'
import { untilDocumentReady } from '../../../utils/dom'

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
    content: string,
    options?: {
        onlyMySelf?: boolean
        shareToEveryOne?: boolean
    },
) {
    await untilDocumentReady()
    await sleep(800)

    // active the compose dialog
    const composeTextarea = nativeComposeTextareaSelector().evaluate()
    const composeButton = nativeComposeButtonSelector().evaluate()
    if (composeTextarea) composeTextarea.focus()
    if (composeButton) composeButton.click()
    await sleep(800)

    // the indicator only available when compose dialog opened successfully
    const composeIndicator = nativeComposeDialogIndicatorSelector().evaluate()
    if (!composeIndicator) {
        alert(i18n.t('automation_request_click_post_button'))
        return
    }

    await sleep(800)
    MessageCenter.emit('compositionUpdated', {
        reason: 'popup',
        open: true,
        content,
        options,
    })
}
