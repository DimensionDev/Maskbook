/* eslint import/no-deprecated: 0 */
import { gun1 } from '.'

/** @deprecated */
export async function queryPersonFromGun(username: string) {
    return gun1.get('users').get(username).then!()
}
