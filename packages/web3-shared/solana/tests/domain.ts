import { describe, expect, it } from 'vitest'
import { isValidDomain } from '../src/helpers/domain.js'

describe('isValidDomain', () => {
    it.each(['alice.sol', 'alice.sns', 'subdomain.alice.sol', 'ALICE.SNS'])('accepts an SNS domain: %s', (domain) => {
        expect(isValidDomain(domain)).toBe(true)
    })

    it.each([undefined, '', '.sol', '.sns', 'alice.eth', 'alice.sns.test'])(
        'rejects a non-SNS domain: %s',
        (domain) => {
            expect(isValidDomain(domain)).toBe(false)
        },
    )
})
