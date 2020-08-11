import { LiveSelector } from '@holoflows/kit/es'
import { MessageCenter } from '../../../utils/messages'
import { i18n } from '../../../utils/i18n-next'
import { sleep } from '../../../utils/utils'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'
import { isMobileFacebook } from '../isMobile'

const nativeComposeButtonSelector = () =>
    new LiveSelector()
        .querySelector<HTMLDivElement>(
            [
                '#pagelet_composer [contenteditable]', // PC - the editor focused at least one time
                '#MComposer [role="button"]', // mobile
            ].join(','),
        )
        .enableSingleMode()

const nativeComposeTextareaSelector = () =>
    new LiveSelector()
        .querySelector<HTMLTextAreaElement>(
            [
                '#pagelet_composer textarea', // PC - the editor haven't foucsed before
                '#structured_composer_form .mentions textarea',
            ].join(','),
        )
        .enableSingleMode()

const nativeComposeDialogIndicatorSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>(
        [
            // PC -  the close button of native compose dialog
            '#pagelet_composer [role="dialog"] [role="button"][tabindex="0"]',

            // mobile - the submit button
            '#composer-main-view-id button[type="submit"]',
        ].join(','),
    )

const nativeComposeDialogLoadedIndiatorSelector = () =>
    new LiveSelector().querySelector<HTMLAnchorElement>(
        [
            // PC - the insert emoji button of native compose dialog
            '#feedx_sprouts_container [role="presentation"] [role="button"][data-hover="tooltip"]',
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

    // PC only
    // we need wait for compose dialog to be fully loaded
    if (!isMobileFacebook) await untilElementAvailable(nativeComposeDialogLoadedIndiatorSelector())

    await sleep(800)
    MessageCenter.emit('compositionUpdated', {
        reason: 'popup',
        open: true,
        content,
        options,
    })
}
