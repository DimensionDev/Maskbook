import {
    packFriendshipCertificate,
    unpackFriendshipCertificate,
    issueFriendshipCertificate,
} from '../protocols/friendship-discovery/friendship-pack'
import { PersonIdentifier } from '../database/type'
import { generate_ECDH_256k1_KeyPair, generate_AES_GCM_256_Key } from '../utils/crypto.subtle'

const aliceID = new PersonIdentifier('localhost', 'alice.test')
async function testFriendshipDiscover() {
    // Alice don't need a keypair during the process
    const bob = await generate_ECDH_256k1_KeyPair()

    const rawCert = await issueFriendshipCertificate(
        aliceID,
        await generate_AES_GCM_256_Key(),
        Math.random().toString(),
    )
    // Alice to bob
    const encryptedCert = await packFriendshipCertificate(rawCert, bob.publicKey)
    console.log('Friendship discover test: Issuer: Alice, to: Bob', rawCert, encryptedCert)

    // Bob verify the cert
    const unpacked = await unpackFriendshipCertificate(encryptedCert, bob.privateKey)
    if (!unpacked) throw new Error('Unpack cert failed')
    if (!unpacked.certificateIssuer.equals(aliceID)) throw new Error('???')

    // Bob should verify their friendship by other channel.
    return true
}
testFriendshipDiscover()
Object.assign(window, { testFriendshipDiscover })
