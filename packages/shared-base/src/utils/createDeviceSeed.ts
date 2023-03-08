import { hexToNumber } from 'web3-utils'
import { createDeviceFingerprint } from './createDeviceFingerprint.js'

/**
 * Create a numeric seed to categorize a device.
 * @returns
 */
export function createDeviceSeed(length = 10) {
    const fingerprint = createDeviceFingerprint()
    return fingerprint ? hexToNumber(fingerprint.slice(0, length)) : 0
}
