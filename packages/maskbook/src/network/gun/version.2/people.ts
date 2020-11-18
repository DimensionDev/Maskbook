import type { ProfileIdentifier } from '../../../database/type'
import { gun2, PersonOnGun2 as ProfileOnGun2 } from '.'
import { hashProfileIdentifier } from './hash'
import { EventIterator } from 'event-iterator'

/**
 * Query person from gun by once.
 * @param user Identifier
 */
export async function queryPersonFromGun2(user: ProfileIdentifier): Promise<ProfileOnGun2> {
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
export async function* subscribeProfileFromGun2(user: ProfileIdentifier) {
    const iter = new EventIterator<ProfileOnGun2>(({ push: callback }) => {
        hashProfileIdentifier(user).then((hash) =>
            gun2.get(hash).on((data: ProfileOnGun2) => {
                const data2 = Object.assign({}, data)
                // @ts-ignore
                delete data2._
                callback(data2)
            }),
        )
    })
    yield* iter
}
/**
 * Note: unused.
 * Write person to gun.
 * @param user Identifier
 * @param data Data needs to write
 */
async function writeProfileOnGun(user: ProfileIdentifier, data: NonNullable<ProfileOnGun2>) {
    return gun2.get(await hashProfileIdentifier(user)).put(data).then!()
}
