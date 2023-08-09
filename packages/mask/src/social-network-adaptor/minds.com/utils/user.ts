import { isNull } from 'lodash-es'
import type { SiteAdaptor } from '@masknet/types'

export const usernameValidator: NonNullable<SiteAdaptor.Utils['isValidUsername']> = (name: string) => {
    for (const v of [/(minds|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }

    return name.length >= 4
}
