import { PersonIdentifier } from '../../../database/type'
import { gun2, PersonOnGun2 } from '.'
import { hashPersonIdentifier } from './hash'

/**
 * Query person from gun by once.
 * @param user Identifier
 */
export async function queryPersonFromGun2(user: PersonIdentifier): Promise<PersonOnGun2> {
    const result = await gun2.get(await hashPersonIdentifier(user)).once().then!()
    return result || {}
}

// ? Gun's off have bugs.
// ? See: https://github.com/amark/gun/issues/541
/**
 * Subscribe changes of this person on gun.
 * @param user Identifier
 * @param callback Callback
 */
export function subscribePersonFromGun2(user: PersonIdentifier, callback: (data: PersonOnGun2) => void) {
    hashPersonIdentifier(user).then(hash =>
        gun2.get(hash).on((data: PersonOnGun2) => {
            const data2 = Object.assign({}, data)
            // @ts-ignore
            delete data2._
            callback(data2)
        }),
    )
    // tslint:disable-next-line: no-parameter-reassignment
    return () => (callback = () => {})
}
/**
 * Write person to gun.
 * @param user Identifier
 * @param data Data needs to write
 */
export async function writePersonOnGun(user: PersonIdentifier, data: NonNullable<PersonOnGun2>) {
    return gun2.get(await hashPersonIdentifier(user)).put(data).then!()
}
