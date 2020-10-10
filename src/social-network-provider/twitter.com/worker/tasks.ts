import type { ProfileIdentifier } from '../../../database/type'
import tasks from '../../../extension/content-script/tasks'
import { getProfileUrlAtTwitter, twitterUrl } from '../utils/url'
import { i18n } from '../../../utils/i18n-next'

export const autoVerifyPost = (self: ProfileIdentifier, prove: string) => {
    tasks(twitterUrl.hostLeadingUrl, {
        active: true,
        autoClose: false,
        memorable: false,
        timeout: Infinity,
    })
        .pasteIntoPostBox(prove, {
            warningText: i18n.t('automation_request_paste_into_post_box'),
            shouldOpenPostDialog: true,
        })
        .then()
}
