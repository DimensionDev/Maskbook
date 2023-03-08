import { describe, it, expect } from 'vitest'
import { isDeviceOnWhitelist } from '../../src/utils/isDeviceOnWhitelist.js'

describe('detect a device whether is in the grayscale range', () => {
    it('grayscale', () => {
        expect(isDeviceOnWhitelist(100)).toBeTruthy()
        expect(isDeviceOnWhitelist(0)).toBeFalsy()
    })
})
