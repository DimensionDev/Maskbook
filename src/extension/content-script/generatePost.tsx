import { generateMyKey } from '../../key-management/keys'
import { sign, verify } from '../../crypto/crypto'
import { storeKey, getMyPrivateKey } from '../../key-management/db'
import { encodeArrayBuffer } from '../../utils/EncodeDecode'

export async function generateMyProvePost() {
    let myKey = await getMyPrivateKey()
    if (!myKey) myKey = await generateMyKey()
    const pub = await crypto.subtle.exportKey('jwk', myKey.key.publicKey!)
    let cont = `I'm using Maskbook to encrypt my posts to prevent Facebook from peeping into them. Install Maskbook as well so that you may read my encrypted posts, and may prevent Facebook from intercepting our communication. Here is my public key >${btoa(
        JSON.stringify(pub),
    )}`
    const sig = await sign(cont, myKey.key.privateKey!)
    cont = cont + '|' + encodeArrayBuffer(sig)
    return cont
}
generateMyProvePost().then(console.log)

export async function verifyOthersProvePost(post: string, othersName: string) {
    const [first, rest] = post.split('>')
    if (!rest) return null
    const [pub, sig] = rest.split('|')
    if (!pub || !sig) return null
    let publicKey: CryptoKey
    try {
        publicKey = await crypto.subtle.importKey(
            'jwk',
            JSON.parse(atob(pub)),
            { name: 'ECDH', namedCurve: 'K-256' },
            true,
            ['deriveKey'],
        )
    } catch {
        throw new Error('Key parse failed')
    }
    const vr = await verify(post.split('|')[0], sig, publicKey)
    if (!vr) throw new Error('Verify Failed!')
    else {
        storeKey({ username: othersName, key: { publicKey: publicKey } })
    }
    return { publicKey, verify: vr }
}

Object.assign(window, {
    genMyPost: generateMyProvePost,
    verifyOthersPost: verifyOthersProvePost,
})
