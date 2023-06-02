import { describe, it, expect } from 'vitest'
import { getABTestSeed } from '../../src/helpers/getABTestSeed.js'

describe('detect if an installation joins the A/B test', () => {
    it('should create an A/B seed in the given range', () => {
        const seed = getABTestSeed(16)

        expect(seed >= 0).toBeTruthy()
        expect(seed < 16).toBeTruthy()
    })
})
