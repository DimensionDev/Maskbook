import { packFriendshipCertificate, unpackFriendshipCertificate, issueFriendshipCertificate } from '../friendship-pack'
import { ProfileIdentifier } from '../../../database/type'
import { CryptoWorker } from '../../../modules/workers'

const aliceID = new ProfileIdentifier('localhost', 'alice.test')
async function testFriendshipDiscover() {
    // Alice don't need a keypair during the process
    const bob = await CryptoWorker.generate_ec_k256_pair()

    const rawCert = await issueFriendshipCertificate(
        aliceID,
        await CryptoWorker.generate_aes_gcm(),
        Math.random().toString(),
    )
    // Alice to bob
    const encryptedCert = await packFriendshipCertificate(rawCert, bob.publicKey)

    // Bob verify the cert
    const unpacked = await unpackFriendshipCertificate(encryptedCert, bob.privateKey)
    if (!unpacked) throw new Error('Unpack cert failed')
    if (!unpacked.certificateIssuer.equals(aliceID)) throw new Error('???')

    // Bob should verify their friendship by other channel.
    return true
}

test('Friendship certificate', () => testFriendshipDiscover())
