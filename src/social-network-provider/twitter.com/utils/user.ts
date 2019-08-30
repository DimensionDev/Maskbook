import { SocialNetworkWorkerAndUI } from '../../../social-network/shared'
import { isNull } from 'lodash-es'

export const usernameValidator: SocialNetworkWorkerAndUI['isValidUsername'] = (name: string) => {
    console.log(name)
    for (const v of [/(twitter|admin)/i, /.{16,}/, /[^A-Za-z0-9_]/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    return true
}
