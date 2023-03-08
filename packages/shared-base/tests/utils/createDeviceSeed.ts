import { describe, it, expect } from 'vitest'
import { createDeviceSeed } from '../../src/utils/createDeviceSeed.js'

describe('create decive seed', () => {
    it('should create a in range', () => {
        const seed = createDeviceSeed(3)

        expect(seed >= 0).toBeTruthy()
        expect(seed < 10).toBeTruthy()
    })
})
