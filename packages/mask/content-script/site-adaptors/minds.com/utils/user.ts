import { isNull } from 'lodash-es'

export function usernameValidator(name: string) {
    for (const v of [/(minds|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }

    return name.length >= 4
}
