import { ProfileIdentifier } from '../../../database/type'
import tasks from '../../../extension/content-script/tasks'
import { getProfileUrl, twitterUrl } from '../utils/url'
import { geti18nString } from '../../../utils/i18n'

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
            warningText: geti18nString('automation_request_paste_into_post_box'),
            shouldOpenPostDialog: true,
        })
        .then()
}
