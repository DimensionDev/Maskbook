import tasks from '../../../extension/content-script/tasks'
import { i18n } from '../../../utils/i18n-next'
import type { ProfileIdentifier } from '../../../database/type'
export function autoVerifyPostFacebook(user: ProfileIdentifier, prove: string) {
    tasks(`https://www.facebook.com/`, {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    }).pasteIntoPostBox(prove, {
        warningText: i18n.t('automation_request_paste_into_post_box'),
        shouldOpenPostDialog: true,
    })
}
