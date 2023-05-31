import { describe, expect, test } from 'vitest'
import { isNewerThan } from '../../src/helpers/isNewerThan.js'

describe('isNewerThan', () => {
    test.each([
        { version: '0.0.0', otherVersion: '1.1.1', expected: false },
        { version: '1.1.1', otherVersion: '1.1.1', expected: false },
        { version: '2.2.2', otherVersion: '1.1.1', expected: true },
        { version: '99.99.99', otherVersion: '1.1.1', expected: true },
    ])('isNewerThan($version, $otherVersion)', ({ version, otherVersion, expected }) => {
        expect(isNewerThan(version, otherVersion)).toEqual(expected)
    })
})
