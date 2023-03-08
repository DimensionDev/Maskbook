import { sha3 } from 'web3-utils'

export function createDeviceFingerprint() {
    return sha3([navigator.userAgent, navigator.language, screen.width, screen.height].join())
}
