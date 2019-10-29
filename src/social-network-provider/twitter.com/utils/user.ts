import { SocialNetworkWorkerAndUI } from '../../../social-network/shared'
import { isNull } from 'lodash-es'
import { PersonIdentifier } from '../../../database/type'
import Services from '../../../extension/service'
import { hostIdentifier } from './url'

/**
 * @link https://help.twitter.com/en/managing-your-account/twitter-username-rules
 */
export const usernameValidator: SocialNetworkWorkerAndUI['isValidUsername'] = (name: string) => {
    for (const v of [/(twitter|admin)/i, /.{16,}/, /[^A-Za-z0-9_]/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    return true
}

export const uploadToService = (payload: { name: string; handle: string; avatar?: string; bio?: string }) => {
    const id = new PersonIdentifier(hostIdentifier, payload.handle)
    if (payload.bio) {
        Services.Crypto.verifyOthersProve(payload.bio, id).then()
    }
    Services.People.updatePersonInfo(id, {
        nickname: payload.name,
        avatarURL: payload.avatar,
    }).then()
}
