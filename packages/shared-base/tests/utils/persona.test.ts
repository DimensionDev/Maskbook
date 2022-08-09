import {
    ECKeyIdentifier,
    isSamePersona,
    isSameProfile,
    PersonaInformation,
    ProfileIdentifier,
    ProfileInformation,
} from '../../src'
import { describe, expect, test } from 'vitest'

describe('Compare is same persons', () => {
    /* cspell:disable-next-line */
    const identifierTextMock = 'Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv'
    /* cspell:disable-next-line */
    const identifierTextMock1 = 'AxxjarSyam+UQa5L0Qo0mibBXtUzwBTo5AbbKV7vhXRM'
    /* cspell:disable-next-line */
    const identifierECKeyTextMock = 'ec_key:secp256k1/Avy0TP3pwfgzipD7h7+eynhAgfa8PLnD9yNR2Q7cUonv'

    test('should return true when give same identifier', () => {
        const persona: PersonaInformation = {
            identifier: new ECKeyIdentifier('secp256k1', identifierTextMock),
            linkedProfiles: [],
        }
        const persona1 = new ECKeyIdentifier('secp256k1', identifierTextMock)
        const persona2 = identifierTextMock
        const persona3: PersonaInformation = {
            identifier: new ECKeyIdentifier('secp256k1', identifierTextMock),
            linkedProfiles: [],
        }
        const persona4 = new ECKeyIdentifier('secp256k1', identifierTextMock)
        const persona5 = identifierTextMock
        const persona6 = identifierECKeyTextMock

        expect(isSamePersona(persona, persona1, persona2, persona3, persona4, persona5, persona6)).toBe(true)
    })

    test('should return true when give different identifier', () => {
        const persona = identifierTextMock1
        const persona1 = new ECKeyIdentifier('secp256k1', identifierECKeyTextMock)
        const persona2 = identifierECKeyTextMock
        const persona3: PersonaInformation = {
            identifier: new ECKeyIdentifier('secp256k1', identifierECKeyTextMock),
            linkedProfiles: [],
        }

        expect(isSamePersona(persona, persona1)).toBe(false)
        expect(isSamePersona(persona, persona2)).toBe(false)
        expect(isSamePersona(persona, persona3)).toBe(false)
    })
})

describe('Compare is same Profile', () => {
    const identifierTextMock = 'person:twitter.com/test_twitter_1'
    const identifierTextMock1 = 'person:twitter.com/test_twitter_2'

    test('should return true when give same identifier', () => {
        const p: ProfileInformation = {
            identifier: ProfileIdentifier.from(identifierTextMock).unwrap(),
        }
        const p1 = ProfileIdentifier.from(identifierTextMock).unwrap()
        const p2 = identifierTextMock
        const p3: ProfileInformation = {
            identifier: ProfileIdentifier.from(identifierTextMock).unwrap(),
        }
        const p4 = ProfileIdentifier.from(identifierTextMock).unwrap()
        const p5 = identifierTextMock

        expect(isSameProfile(p, p1, p2, p3, p4, p5)).toBe(true)
    })

    test('should return true when give different identifier', () => {
        const p = identifierTextMock1
        const p1 = ProfileIdentifier.from(identifierTextMock).unwrap()
        const p2 = identifierTextMock
        const p3: ProfileInformation = {
            identifier: ProfileIdentifier.from(identifierTextMock).unwrap(),
        }

        expect(isSameProfile(p, p1)).toBe(false)
        expect(isSameProfile(p, p2)).toBe(false)
        expect(isSameProfile(p, p3)).toBe(false)
    })
})
