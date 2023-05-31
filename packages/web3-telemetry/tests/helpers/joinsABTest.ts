import { describe, it, expect } from 'vitest'
import { joinsABTest } from '../../src/helpers/joinsABTest.js'

describe('detect if an installation joins the A/B test', () => {
    it('should calculate join A/B test correctly', () => {
        expect(joinsABTest(100)).toBeTruthy()
        expect(joinsABTest(0)).toBeFalsy()
    })
})
