import { describe, expect, it } from 'vitest'
import type { SecurityAPI } from '../../src/entry-types.js'
import { isMaliciousAddress } from '../../src/GoPlusLabs/isMaliciousAddress.js'

function createAddressSecurity(overrides: Partial<SecurityAPI.AddressSecurity> = {}): SecurityAPI.AddressSecurity {
    return {
        data_source: 'GoPlus',
        honeypot_related_address: '0',
        phishing_activities: '0',
        blackmail_activities: '0',
        stealing_attack: '0',
        fake_kyc: '0',
        malicious_mining_activities: '0',
        darkweb_transactions: '0',
        cybercrime: '0',
        money_laundering: '0',
        financial_crime: '0',
        blacklist_doubt: '0',
        contract_address: '0',
        ...overrides,
    }
}

describe('isMaliciousAddress', () => {
    it('should return false when no risk flag is set', () => {
        expect(isMaliciousAddress(createAddressSecurity())).toBe(false)
    })

    it('should not treat a contract address as malicious (e.g. EIP-7702 delegated EOAs)', () => {
        expect(isMaliciousAddress(createAddressSecurity({ contract_address: '1' }))).toBe(false)
    })

    it('should return true when any malicious risk flag is set', () => {
        expect(isMaliciousAddress(createAddressSecurity({ phishing_activities: '1' }))).toBe(true)
        expect(isMaliciousAddress(createAddressSecurity({ honeypot_related_address: '1' }))).toBe(true)
    })
})
