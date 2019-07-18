import {
    packFriendshipCertificate,
    unpackFriendshipCertificate,
} from '../protocols/friendship-discovery/friendship-pack'

async function testFriendshipDiscover() {
    // Alice don't need a keypair during the process
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])

    // Alice to bob
    const cert = await packFriendshipCertificate({ myId: 'alice', network: 'test-network' }, bob.publicKey)
    console.debug('Friendship discover test: bob cert signed by alice', cert)

    // Bob verify the cert
    const unpacked = await unpackFriendshipCertificate(cert, bob.privateKey)
    if (!unpacked) throw new Error('Unpack cert failed')
    if (unpacked.myId !== 'alice' || unpacked.network !== 'test-network') throw new Error('???')

    // Bob should verify their friendship by other channel.
    return true
}
testFriendshipDiscover()
Object.assign(window, { testFriendshipDiscover })
