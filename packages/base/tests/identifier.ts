/* cspell:disable */
import { ECKeyIdentifier, ProfileIdentifier } from '../src/index.js'
import { describe, expect, test } from 'vitest'

describe('ECKeyIdentifier', () => {
    const identifierTextMock = 'Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv'
    const identifierTextMock1 = 'AxxjarSyam+UQa5L0Qo0mibBXtUzwBTo5AbbKV7vhXRM'
    const identifierECKeyTextMock = 'ec_key:secp256k1/Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv'

    const a = new ECKeyIdentifier('secp256k1', identifierTextMock)
    expect(a).instanceOf(ECKeyIdentifier)
    test('should have same identity for the same ECKeyIdentifier', () => {
        const a2 = new ECKeyIdentifier('secp256k1', identifierTextMock)
        const a3 = ECKeyIdentifier.from(identifierECKeyTextMock).unwrap()
        const a4 = ECKeyIdentifier.from(identifierECKeyTextMock).unwrap()
        expect(new Set([a, a2, a3, a4]).size).toBe(1)

        const b = new ECKeyIdentifier('secp256k1', identifierTextMock1)
        expect(a).not.toBe(b)

        expect(a.curve).toMatchInlineSnapshot('"secp256k1"')
        expect(a.publicKeyAsHex).toMatchInlineSnapshot(
            '"0x02fcb44cfde9c1f8338a90fb87bf9eca784081f6bc3cb9c3f72351d90edc5289ef"',
        )
        expect(a.rawPublicKey).toMatchInlineSnapshot('"Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv"')
        expect(a.toText()).toMatchInlineSnapshot('"ec_key:secp256k1/Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv"')
    })

    test('should be immutable', () => {
        expect(() => Object.assign(a, { curve: 'secp256p1' })).throws()
        expect(() => Object.assign(a, { publicKeyAsHex: 'a' })).throws()
        expect(() => Object.assign(a, { rawPublicKey: 'b' })).throws()
        expect(() => Object.assign(a, { extraKey: true })).throws()
    })
})

describe('ProfileIdentifier', () => {
    const identifierTextMock = 'person:twitter.com/test_twitter_1'
    const identifierTextMock1 = 'person:twitter.com/test_twitter_2'

    const a = ProfileIdentifier.from(identifierTextMock).unwrap()
    expect(a).instanceOf(ProfileIdentifier)
    test('should have same identity for the same ProfileIdentifier', () => {
        const a2 = ProfileIdentifier.from(identifierTextMock).unwrap()
        const a3 = ProfileIdentifier.of('twitter.com', 'test_twitter_1').unwrap()
        const a4 = ProfileIdentifier.of('twitter.com', 'test_twitter_1').unwrap()
        expect(new Set([a, a2, a3, a4]).size).toBe(1)

        const b = ProfileIdentifier.from(identifierTextMock1)
        expect(a).not.toBe(b)

        expect(a.network).toMatchInlineSnapshot('"twitter.com"')
        expect(a.userId).toMatchInlineSnapshot('"test_twitter_1"')
        expect(a.toText()).toMatchInlineSnapshot('"person:twitter.com/test_twitter_1"')
    })
    // Note: ProfileIdentifier MUST NOT be case insensitive. It's toText() result will be used as password of stego.
    //       change it to canse insensitive is a breaking change.
    test('should NOT be case insensitive', () => {
        const a2 = ProfileIdentifier.from('person:twitter.com/Test_twitter_1').unwrap()
        expect(a).not.toBe(a2)
    })
    test('should be immutable', () => {
        expect(() => Object.assign(a, { network: 'twitter.com' })).throws()
        expect(() => Object.assign(a, { userId: 'test_twitter_1' })).throws()
        expect(() => Object.assign(a, { extraKey: true })).throws()
    })

    test('.from()', () => {
        expect(ProfileIdentifier.from(undefined).isNone()).toBe(true)
        expect(ProfileIdentifier.from(null).isNone()).toBe(true)
        expect(ProfileIdentifier.from('other:a.com/test').isNone()).toBe(true)
        expect(ProfileIdentifier.from('person:localhost/$unknown').isNone()).toBe(true)
    })

    test('.of()', () => {
        expect(ProfileIdentifier.of(null, 'test_twitter_1').isNone()).toBe(true)
        expect(ProfileIdentifier.of('twitter.com', null).isNone()).toBe(true)
        expect(ProfileIdentifier.of('localhost', '$unknown').isNone()).toBe(true)
    })
})
