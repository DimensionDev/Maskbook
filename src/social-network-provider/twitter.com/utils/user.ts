import type { SocialNetworkWorkerAndUI } from '../../../social-network/shared'
import { isNull } from 'lodash-es'

/**
 * @link https://help.twitter.com/en/managing-your-account/twitter-username-rules
 */
export const usernameValidator: SocialNetworkWorkerAndUI['isValidUsername'] = (name: string) => {
    for (const v of [/(twitter|admin)/i, /.{16,}/, /[^A-Za-z0-9_]/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    if (name.length < 4) return false
    return true
}
