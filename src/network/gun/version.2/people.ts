import { ProfileIdentifier } from '../../../database/type'
import { gun2, PersonOnGun2 } from '.'
import { hashProfileIdentifier } from './hash'

/**
 * Query person from gun by once.
 * @param user Identifier
 */
export async function queryPersonFromGun2(user: ProfileIdentifier): Promise<PersonOnGun2> {
    const result = await gun2.get(await hashProfileIdentifier(user)).then!()
    return result || {}
}

// ? Gun's off have bugs.
// ? See: https://github.com/amark/gun/issues/541
/**
 * Subscribe changes of this person on gun.
 * @param user Identifier
 * @param callback Callback
 */
export function subscribePersonFromGun2(user: ProfileIdentifier, callback: (data: PersonOnGun2) => void) {
    hashProfileIdentifier(user).then(hash =>
        gun2.get(hash).on((data: PersonOnGun2) => {
            const data2 = Object.assign({}, data)
            // @ts-ignore
            delete data2._
            callback(data2)
        }),
    )
    return () => (callback = () => {})
}
/**
 * Write person to gun.
 * @param user Identifier
 * @param data Data needs to write
 */
export async function writePersonOnGun(user: ProfileIdentifier, data: NonNullable<PersonOnGun2>) {
    return gun2.get(await hashProfileIdentifier(user)).put(data).then!()
}
