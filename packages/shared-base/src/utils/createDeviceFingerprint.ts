import { sha3 } from 'web3-utils'

/**
 * The constant fingerprint of device.
 * @returns
 */
export function createDeviceFingerprint() {
    return sha3(
        [
            navigator.userAgent,
            navigator.language,
            navigator.maxTouchPoints,
            navigator.hardwareConcurrency,
            screen.width,
            screen.height,
        ].join(),
    )
}
