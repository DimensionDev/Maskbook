import tasks from '../../../extension/content-script/tasks'
import { geti18nString } from '../../../utils/i18n'
export function autoVerifyPostFacebook(prove: string) {
    tasks(`https://www.facebook.com/`, {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    }).pasteIntoPostBox(prove, geti18nString('automation_request_paste_into_post_box'))
}
