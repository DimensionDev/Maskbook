import { Buffer } from 'buffer'
import bs58 from 'bs58'
import { SOL_ADDRESS } from '../constants'

// #region formatter
export function formatAddress(address: string, size?: number) {
    return address
}
// #endregion

// #region validator
export function isValidDomain(domain: string) {
    return /.+\.sol/i.test(domain)
}

export function isValidAddress(address: string) {
    return true
}
// #endregion

export function hexToBase58(hex: string) {
    const buffer = Buffer.from(hex, 'hex')
    return bs58.encode(buffer)
}

export function isNativeTokenAddress(address: string) {
    return address === SOL_ADDRESS
}
