import { describe, expect, test } from 'vitest'
import { parseVersion } from '../../src/helpers/parseVersion.js'

describe('parseVersion', () => {
    test.each([
        { version: '0.0.0', parsedVersion: [0, 0, 0] },
        { version: '2.2.2', parsedVersion: [2, 2, 2] },
        { version: '2.12.3*', parsedVersion: [2, 12, 3] },
        { version: '99.99.99', parsedVersion: [99, 99, 99] },
    ])('parseVersion($version)', ({ version, parsedVersion }) => {
        expect(parseVersion(version)).toEqual(parsedVersion)
    })
})
