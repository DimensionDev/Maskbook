import {
    ECKeyIdentifier,
    GroupIdentifier,
    Identifier,
    PostIVIdentifier,
    PostIdentifier,
    ProfileIdentifier,
    PreDefinedVirtualGroupNames,
} from '../type'
import { generate_ECDH_256k1_KeyPair, import_ECDH_256k1_Key } from '../../utils/crypto.subtle'

test('ProfileIdentifier', () => {
    const normal = new ProfileIdentifier('facebook.com', 'user_id')
    expect(normal.toText()).toBe('person:facebook.com/user_id')
    expect(normal.friendlyToText()).toBe('user_id@facebook.com')
    expect(normal.network).toBe('facebook.com')
    expect(normal.userId).toBe('user_id')
    expect(normal.isUnknown).toBe(false)

    expect(ProfileIdentifier.unknown.isUnknown).toBe(true)
    expect(ProfileIdentifier.unknown.toText()).toBe('person:localhost/$unknown')

    expect(() => new ProfileIdentifier('facebook.com', 'a/b')).toThrowError()
})

test('PostIdentifier', () => {
    const normal = new ProfileIdentifier('facebook.com', 'user_id')
    const post = new PostIdentifier(normal, 'post_id_1234')

    expect(post.toText()).toBe('post:post_id_1234/person:facebook.com/user_id')
    expect(post.identifier.toText()).toBe('person:facebook.com/user_id')
    expect(post.postId).toBe('post_id_1234')

    expect(() => new PostIdentifier(normal, 'invalid/post/id')).toThrowError()
})

test('PostIVIdentifier', () => {
    const post = new PostIVIdentifier('facebook.com', 'akmfkmekfmew')
    new PostIVIdentifier('facebook.com', 'fejwnk/wngkr')

    expect(post.toText()).toBe('post_iv:facebook.com/akmfkmekfmew')
})

test('ECKeyIdentifier', async () => {
    const ec_id = new ECKeyIdentifier('secp256k1', 'ApDhiWBPBjMDMbUzP0JdI0WnXwo/a2kctSnMkkJz9mPm')

    expect(ec_id.toText()).toBe('ec_key:secp256k1/ApDhiWBPBjMDMbUzP0JdI0WnXwo|a2kctSnMkkJz9mPm')
    expect(ec_id.compressedPoint).toBe('ApDhiWBPBjMDMbUzP0JdI0WnXwo/a2kctSnMkkJz9mPm')
    expect(ec_id.curve).toBe('secp256k1')
    expect(ec_id.type).toBe('ec_key')

    const jwk = {
        crv: 'K-256',
        ext: true,
        x: '7seqxT72nd8UhC8tIWKqux0LWT-de7sDVSYqO4vLJnI',
        y: 'oNRjB320h3p4TUbjZmHk5iZByPp0Q6aT4MX9BpA2mmM',
        key_ops: ['deriveKey'],
        kty: 'EC',
    }
    const ecKeyID = 'ec_key:secp256k1/A+7HqsU+9p3fFIQvLSFiqrsdC1k|nXu7A1UmKjuLyyZy'
    const cryptoKey = await import_ECDH_256k1_Key(jwk)
    expect((await ECKeyIdentifier.fromCryptoKey(cryptoKey)).toText()).toBe(ecKeyID)
    expect(ECKeyIdentifier.fromJsonWebKey(jwk).toText()).toBe(ecKeyID)
})

test('GroupIdentifier', () => {
    const virtualG = new GroupIdentifier('facebook.com', 'owner', PreDefinedVirtualGroupNames.friends)
    const realG = new GroupIdentifier('facebook.com', null, PreDefinedVirtualGroupNames.followers)

    expect(virtualG.toText()).toBe('group:facebook.com/owner/_default_friends_group_')
    expect(virtualG.groupID).toBe('_default_friends_group_')
    expect(virtualG.isReal).toBe(false)
    expect(virtualG.isVirtual).toBe(true)
    expect(virtualG.network).toBe('facebook.com')
    expect(virtualG.ownerIdentifier?.toText()).toBe('person:facebook.com/owner')
    expect(virtualG.virtualGroupOwner).toBe('owner')

    expect(realG.toText()).toBe('group:facebook.com//_followers_group_')
    expect(realG.groupID).toBe('_followers_group_')
    expect(realG.isReal).toBe(true)
    expect(realG.isVirtual).toBe(false)
    expect(realG.network).toBe('facebook.com')
    expect(realG.ownerIdentifier?.toText()).toBe(undefined)
    expect(realG.virtualGroupOwner).toBe(null)

    expect(() => new GroupIdentifier('facebook.com', 'owner', '/')).toThrowError()
})

test('Stable PreDefinedVirtualGroupNames', () => {
    expect(PreDefinedVirtualGroupNames.followers).toBe('_followers_group_')
    expect(PreDefinedVirtualGroupNames.following).toBe('_following_group_')
    expect(PreDefinedVirtualGroupNames.friends).toBe('_default_friends_group_')
})

test('Static Identifier method', () => {
    const normal = new ProfileIdentifier('facebook.com', 'user_id')
    const normal2 = new ProfileIdentifier('facebook.com', 'user_id2')
    expect(Identifier.IdentifiersToString([normal, normal2])).toBe(
        'person:facebook.com/user_id,person:facebook.com/user_id2',
    )
    expect(Identifier.IdentifiersToString([normal, normal2], true)).toBe(
        'person:facebook.com/user_id,person:facebook.com/user_id2',
    )
    expect(Identifier.IdentifiersToString([normal, normal2], true)).not.toBe(
        Identifier.IdentifiersToString([normal2, normal], true),
    )
    expect(Identifier.IdentifiersToString([normal, normal2])).toBe(Identifier.IdentifiersToString([normal2, normal]))

    const virtualG = new GroupIdentifier('facebook.com', 'owner', PreDefinedVirtualGroupNames.friends)
    const realG = new GroupIdentifier('facebook.com', null, PreDefinedVirtualGroupNames.followers)

    expect(virtualG.equals(realG)).toBe(false)
    expect(virtualG.equals(virtualG)).toBe(true)
    expect(normal.equals(realG)).toBe(false)
    expect(Identifier.equals(realG, realG)).toBe(true)
    expect(Identifier.equals(realG, normal)).toBe(false)

    expect(() => Identifier.fromString('').unwrap('err')).toThrowError()
    expect(Identifier.fromString('').value).toBeFalsy()
    expect(Identifier.fromString('person:facebook.com/user_id').value).toBeInstanceOf(ProfileIdentifier)
    {
        const post = Identifier.fromString('post:post_id_1234/person:facebook.com/user_id').value
        expect(post).toBeInstanceOf(PostIdentifier)
        expect((post as PostIdentifier).identifier.toText()).toBe(normal.toText())
    }
    expect(Identifier.fromString('post_iv:facebook.com/akmfkmekfmew').value).toBeInstanceOf(PostIVIdentifier)
    expect(Identifier.fromString('ec_key:secp256k1/ApDhiWBPBjMDMbUzP0JdI0WnXwo|a2kctSnMkkJz9mPm').value).toBeInstanceOf(
        ECKeyIdentifier,
    )
    expect(Identifier.fromString('group:facebook.com/owner/_default_friends_group_').value).toBeInstanceOf(
        GroupIdentifier,
    )

    expect(
        Identifier.fromString('group:facebook.com/owner/_default_friends_group_', GroupIdentifier).value,
    ).toBeInstanceOf(GroupIdentifier)
    expect(
        Identifier.fromString('group:facebook.com/owner/_default_friends_group_', ProfileIdentifier).value,
    ).toBeFalsy()
    expect(() =>
        Identifier.fromString('group:facebook.com/owner/_default_friends_group_', ProfileIdentifier).unwrap(''),
    ).toThrowError()
})
