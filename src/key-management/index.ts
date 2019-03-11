import Gun from 'gun'
import 'gun/lib/then'
import { sleep } from '../utils/utils'
import { queryPersonCryptoKey, PersonCryptoKey } from './db'

interface Person {
    provePostId: string
}
interface MaskbookDemoServerState {
    maskbook: {
        users: {
            [user: string]: Person
        }
    }
}
const gun = new Gun<MaskbookDemoServerState>('https://gungame.herokuapp.com/gun').get('maskbook')

export async function queryPerson(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}

export function addPersonPublicKey(username: string) {
    return new Promise<PersonCryptoKey>(async (resolve, reject) => {
        const person = await queryPerson(username)
        if (!person) reject('User not in gun')
        const provePost = `https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/${username}/posts/${
            person.provePostId
        }&width=500`
        const ir = document.createElement('iframe')
        ir.src = provePost
        document.body.appendChild(ir)
        ir.onload = async () => {
            await sleep(200)
            resolve((await queryPersonCryptoKey(username))!)
        }
    })
}

export async function uploadProvePostUrl(username: string, postId: string) {
    return gun.get('users').put({ [username]: { provePostId: postId } }).then!()
}
Object.assign(window, { queryPerson, uploadProvePostUrl, addKey: addPersonPublicKey })
