import { isNull } from 'lodash-es'

export function usernameValidator(name: string) {
    for (const v of [/(minds|admin)/iu, /.{16,}/u, /\W/u]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }

    return name.length >= 4
}
