import { isNull } from 'lodash-es'
import type { SocialNetwork } from '../../../social-network'

export const usernameValidator: NonNullable<SocialNetwork.Utils['isValidUsername']> = (name: string) => {
    for (const v of [/(minds|admin)/i, /.{16,}/, /[^A-Za-z0-9_]/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }

    return name.length >= 4
}
