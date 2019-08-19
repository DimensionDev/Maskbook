import { PersonIdentifier } from '../../../database/type'
import tasks from '../../../extension/content-script/tasks'
import { toProfileUrl } from '../utils/url'
import { sharedSettings } from '../index'
import { geti18nString } from '../../../utils/i18n'

export const autoVerifyBio = (self: PersonIdentifier, prove: string) => {
    tasks(toProfileUrl(self), {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    })
        .pasteIntoBio(prove)
        .then()
}

export const autoVerifyPost = (self: PersonIdentifier, prove: string) => {
    tasks(sharedSettings.networkURL as string, {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    })
        .pasteIntoPostBox(prove, geti18nString('automation_request_paste_into_post_box'))
        .then()
}
