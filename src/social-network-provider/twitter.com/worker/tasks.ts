import { ProfileIdentifier } from '../../../database/type'
import tasks from '../../../extension/content-script/tasks'
import { getProfileUrl, twitterUrl } from '../utils/url'
import { i18n } from '../../../utils/i18n-next'

export const autoVerifyBio = (self: ProfileIdentifier, prove: string) => {
    tasks(getProfileUrl(self), {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    })
        .pasteIntoBio(prove)
        .then()
}

export const autoVerifyPost = (self: ProfileIdentifier, prove: string) => {
    tasks(twitterUrl.hostLeadingUrl, {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    })
        .pasteIntoPostBox(prove, {
            warningText: i18n.t('automation_request_paste_into_post_box'),
            shouldOpenPostDialog: true,
        })
        .then()
}
