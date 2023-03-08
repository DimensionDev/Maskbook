import { createDeviceSeed } from './createDeviceSeed.js'

/**
 * Detect whether a device is in the grayscale range.
 * @param grayscale 0 - 100
 */
export function isDeviceOnWhitelist(grayscale = 50) {
    const seed = createDeviceSeed(4)
    return seed <= Math.round((255 * grayscale) / 100)
}
