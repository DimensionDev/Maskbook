import { hexToNumber } from 'web3-utils'
import { createDeviceFingerprint } from './createDeviceFingerprint.js'

/**
 * Create a numeric seed to categorize a device.
 * @returns
 */
export function createDeviceSeed() {
    const fingerprint = createDeviceFingerprint()
    return fingerprint ? hexToNumber(fingerprint.slice(0, 10)) : 0
}
