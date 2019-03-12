import 'webcrypto-liner/dist/webcrypto-liner.shim'
// ! This is not a debug statement
Object.assign(window, {
    elliptic: require('elliptic'),
})
import './crypto'
// tslint:disable: await-promise
function deriveSecretKey(privateKey: CryptoKey, publicKey: CryptoKey) {
    return crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
}
async function transform(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('jwk', key)
    return crypto.subtle.importKey('jwk', exported, { name: 'ecdsa', namedCurve: 'K-256' }, true, ['sign', 'verify'])
}
async function main() {
    // debug usage
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const derived = await deriveSecretKey(alice.privateKey, bob.publicKey)

    const alicePubECDSA = await transform(alice.publicKey)
    const alicePrivECDSA = await transform(alice.privateKey)
    const bobPubECDSA = await transform(bob.publicKey)
    const bobPrivECDSA = await transform(bob.privateKey)
    Object.assign(window, {
        alice,
        bob,
        derived,
        ecdsa: { alice: [alicePubECDSA, alicePrivECDSA], bob: [bobPubECDSA, bobPrivECDSA] },
    })
}
main()
