import tasks from '../../../extension/content-script/tasks'
import type { ProfileIdentifier } from '../../../database/type'
import { getProfilePageUrlAtFacebook } from '../parse-username'
export function autoVerifyBioFacebook(user: ProfileIdentifier, prove: string) {
    tasks(getProfilePageUrlAtFacebook(user, 'open'), {
        active: true,
        autoClose: false,
        memorable: false,
        pinned: false,
        timeout: Infinity,
    }).pasteIntoBio(prove)
}
