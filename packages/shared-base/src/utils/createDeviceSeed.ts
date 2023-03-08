import { hexToNumber } from 'web3-utils'
import { createDeviceFingerprint } from './createDeviceFingerprint.js'

export function createDeviceSeed() {
    const footprint = createDeviceFingerprint()
    return footprint ? hexToNumber(footprint.slice(0, 10)) : 0
}
