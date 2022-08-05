import { xdescribe, test, expect } from '@jest/globals'
import { ECKeyIdentifier, isSamePersona } from '../../src'

const testIdentifier = ''

xdescribe('Compare is same persons', () => {
    test('should return true when give same identifier', () => {
        const persona1 = new ECKeyIdentifier('secp256k1', testIdentifier)
        const persona2 = new ECKeyIdentifier('secp256k1', testIdentifier)

        expect(isSamePersona(persona1, persona2))
    })
})
