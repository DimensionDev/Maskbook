import { expect, describe, it } from 'vitest'
import { attemptUntil } from '../../src/helpers/attemptUntil.js'

describe('utils attemptUntil function test', function () {
    it('should return first promise result which is success', async () => {
        const p1 = () => Promise.resolve(1)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null)

        expect(result).toBe(1)
    })

    it('should return second promise result which is success', async () => {
        const p1 = () => Promise.reject(1)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null)

        expect(result).toBe(2)
    })

    it('should return second promise result when first result is undefined', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null)

        expect(result).toBe(2)
    })

    it('should return undefined promise result when first result is undefined and in strict mode', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], undefined, () => false)

        expect(result).toBe(undefined)
    })

    it('should use fallback result when first result is undefined and in strict mode', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const fallback = 3

        const result = await attemptUntil([p1, p2], fallback, () => false)

        expect(result).toBe(3)
    })

    it('should throw error when all the promise rejected', async () => {
        const p1 = () => Promise.reject(new Error('p1'))
        const p2 = () => Promise.reject(new Error('p2'))

        await expect(attemptUntil([p1, p2], undefined)).rejects.toThrowError()
    })
})
