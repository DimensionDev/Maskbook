import { sleep } from '../utils/utils'
import { queryPersonCryptoKey, PersonCryptoKey } from './keystore-db'
import { gun } from './gun'

export async function queryPerson(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}

export function addPersonPublicKey(username: string) {
    return new Promise<PersonCryptoKey>(async (resolve, reject) => {
        const person = await queryPerson(username)
        if (!person) return reject(`User ${username} not in gun`)
        // https://www.facebook.com/permalink.php?story_fbid=117886292707657&id=100034588593645
        let url
        if (username.match(/^\d+$/))
            url = `https://www.facebook.com/permalink.php?story_fbid=${person.provePostId}&id=${username}`
        else url = `https://www.facebook.com/${username}/posts/${person.provePostId}&width=500`
        const provePost = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}`
        const ir = document.createElement('iframe')
        ir.src = provePost
        document.body.appendChild(ir)
        ir.onload = async () => {
            let key = await queryPersonCryptoKey(username)
            while (!key) {
                await sleep(50)
                key = await queryPersonCryptoKey(username)
            }
            resolve(key)
            ir.remove()
        }
    })
}

export async function uploadProvePostUrl(username: string, postId: string) {
    if (!postId) return
    return gun.get('users').put({ [username]: { provePostId: postId } }).then!()
}
Object.assign(window, { queryPerson, uploadProvePostUrl, addKey: addPersonPublicKey })
