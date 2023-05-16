import { describe, it, expect } from 'vitest'
import { joinsABTest, getABTestSeed } from '../../src/utils/ABTest.js'

describe('detect if an installation joins the A/B test', () => {
    it('should calculate join A/B test correctly', () => {
        expect(joinsABTest(100)).toBeTruthy()
        expect(joinsABTest(0)).toBeFalsy()
    })
    it('should create an A/B seed in the given range', () => {
        const seed = getABTestSeed(16)

        expect(seed >= 0).toBeTruthy()
        expect(seed < 16).toBeTruthy()
    })
})
