import { isNull } from 'lodash-es'
import type { SocialNetwork } from '../../../social-network'

export const usernameValidator: NonNullable<SocialNetwork.Utils['isValidUsername']> = (name: string) => {
    for (const v of [/(minds|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }

    return name.length >= 4
}
