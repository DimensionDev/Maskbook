import { hexToNumber } from 'web3-utils'
import { createDeviceFingerprint } from './createDeviceFingerprint.js'

/**
 * Create a numeric seed to categorize a device.
 * @returns
 */
export function createDeviceSeed(length = 10) {
    if (length < 3) throw new Error('underflow')
    if (length > 66) throw new Error('overflow')

    const fingerprint = createDeviceFingerprint()
    return fingerprint ? hexToNumber(fingerprint.slice(0, length)) : 0
}
