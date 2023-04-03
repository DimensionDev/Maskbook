import { describe, expect, test } from 'vitest'
import { isSameVersion } from '../../src/helpers/isSameVersion.js'

describe('isSameVersion', () => {
    test.each([
        { version: '0.0.0', otherVersion: '0.0.0', expected: true },
        { version: '2.2.2', otherVersion: '2.2.1', expected: false },
        { version: '2.12.3*', otherVersion: '2.12.3', expected: true },
    ])('isSameVersion($version, $otherVersion)', ({ version, otherVersion, expected }) => {
        expect(isSameVersion(version, otherVersion)).toEqual(expected)
    })
})
