import type { SecurityAPI } from '../entry-types.js'

/**
 * "is a contract" is not "is malicious" (e.g. EIP-7702 delegated EOAs are
 * flagged as contracts by GoPlus); contract-ness is judged locally via
 * getAddressType, which handles 7702 correctly.
 */
export function isMaliciousAddress(security: SecurityAPI.AddressSecurity): boolean {
    const { contract_address: _, data_source: __, ...risks } = security
    return Object.values(risks).includes('1')
}
